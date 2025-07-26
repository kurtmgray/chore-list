import { Kysely } from 'kysely';
import type { DB } from '../types/database';

export class PropertyValidationService {
  constructor(private db: Kysely<DB>) {}
  
  async validateCategoryPropertySchema(categoryId: number, propertySchema: any): Promise<void> {
    // Extract property names from the schema
    const schemaPropertyNames = propertySchema.properties?.map((p: any) => p.name) || [];
    
    // Get valid property definitions
    const validProperties = await this.db
      .selectFrom('property_definitions')
      .select(['name'])
      .where('is_global', '=', true)
      .execute();
    
    const validPropertyNames = validProperties.map(p => p.name);
    
    // Check for invalid property references
    const invalidProperties = schemaPropertyNames.filter(
      (name: string) => !validPropertyNames.includes(name)
    );
    
    if (invalidProperties.length > 0) {
      throw new Error(
        `Invalid property references in category schema: ${invalidProperties.join(', ')}`
      );
    }
  }
  
  async validateChoreProperties(choreProperties: any, categoryId: number): Promise<void> {
    // Get category's property schema
    const category = await this.db
      .selectFrom('categories')
      .select(['property_schema'])
      .where('id', '=', categoryId)
      .executeTakeFirst();
    
    if (!category) return;
    
    const schema = category.property_schema as any;
    const allowedProperties = schema.properties?.map((p: any) => p.name) || [];
    
    // Check if chore properties match schema
    const chorePropertyNames = Object.keys(choreProperties || {});
    const invalidProperties = chorePropertyNames.filter(
      name => !allowedProperties.includes(name)
    );
    
    if (invalidProperties.length > 0) {
      throw new Error(
        `Invalid properties for this category: ${invalidProperties.join(', ')}`
      );
    }

    // Validate required properties
    const requiredProperties = schema.properties?.filter((p: any) => p.required) || [];
    const missingRequired = requiredProperties
      .map((p: any) => p.name)
      .filter((name: string) => !(name in (choreProperties || {})));

    if (missingRequired.length > 0) {
      throw new Error(
        `Missing required properties: ${missingRequired.join(', ')}`
      );
    }
  }

  async validatePropertyValues(properties: any, categoryId: number): Promise<void> {
    // Get category schema and property definitions
    const category = await this.db
      .selectFrom('categories')
      .select(['property_schema'])
      .where('id', '=', categoryId)
      .executeTakeFirst();

    if (!category) return;

    const schema = category.property_schema as any;
    const schemaProperties = schema.properties || [];

    // Get property definitions for validation rules
    const propertyNames = schemaProperties.map((p: any) => p.name);
    const propertyDefinitions = await this.db
      .selectFrom('property_definitions')
      .select(['name', 'type', 'validation_rules'])
      .where('name', 'in', propertyNames)
      .execute();

    // Validate each property value
    for (const [propName, propValue] of Object.entries(properties || {})) {
      const definition = propertyDefinitions.find(pd => pd.name === propName);
      if (!definition) continue;

      const rules = definition.validation_rules as any || {};

      // Type-specific validation
      switch (definition.type) {
        case 'number':
          if (typeof propValue !== 'number') {
            throw new Error(`Property ${propName} must be a number`);
          }
          if (rules.min !== undefined && propValue < rules.min) {
            throw new Error(`Property ${propName} must be at least ${rules.min}`);
          }
          if (rules.max !== undefined && propValue > rules.max) {
            throw new Error(`Property ${propName} must be at most ${rules.max}`);
          }
          break;

        case 'text':
          if (typeof propValue !== 'string') {
            throw new Error(`Property ${propName} must be a string`);
          }
          if (rules.maxLength && propValue.length > rules.maxLength) {
            throw new Error(`Property ${propName} must be at most ${rules.maxLength} characters`);
          }
          break;

        case 'currency':
          if (typeof propValue !== 'number' || propValue < 0) {
            throw new Error(`Property ${propName} must be a positive number`);
          }
          break;

        case 'date':
          if (!(propValue instanceof Date) && !Date.parse(propValue)) {
            throw new Error(`Property ${propName} must be a valid date`);
          }
          break;

        case 'boolean':
          if (typeof propValue !== 'boolean') {
            throw new Error(`Property ${propName} must be a boolean`);
          }
          break;
      }
    }
  }
}
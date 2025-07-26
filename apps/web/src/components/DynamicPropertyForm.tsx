import { useState, useEffect } from 'react';

interface PropertyDefinition {
  name: string;
  type: string;
  label: string;
  description?: string;
  validation_rules?: any;
  required?: boolean;
}

interface PropertySchema {
  properties: PropertyDefinition[];
}

interface DynamicPropertyFormProps {
  schema: PropertySchema;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  errors?: Record<string, string>;
}

export function DynamicPropertyForm({ 
  schema, 
  values, 
  onChange, 
  errors = {} 
}: DynamicPropertyFormProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>(values);

  useEffect(() => {
    setFormValues(values);
  }, [values]);

  const handleChange = (name: string, value: any) => {
    const newValues = { ...formValues, [name]: value };
    setFormValues(newValues);
    onChange(newValues);
  };

  const renderField = (property: PropertyDefinition) => {
    const fieldValue = formValues[property.name] || '';
    const hasError = errors[property.name];
    const rules = property.validation_rules || {};

    const baseInputClasses = `
      mt-1 block w-full rounded-md border px-3 py-2 text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      ${hasError 
        ? 'border-red-300 bg-red-50' 
        : 'border-gray-300 bg-white'
      }
    `;

    switch (property.type) {
      case 'text':
        return (
          <input
            type="text"
            value={fieldValue}
            onChange={(e) => handleChange(property.name, e.target.value)}
            className={baseInputClasses}
            placeholder={property.description}
            maxLength={rules.maxLength}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={fieldValue}
            onChange={(e) => handleChange(property.name, e.target.value)}
            className={`${baseInputClasses} resize-none`}
            rows={3}
            placeholder={property.description}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={fieldValue}
            onChange={(e) => handleChange(property.name, parseFloat(e.target.value) || 0)}
            className={baseInputClasses}
            placeholder={property.description}
            min={rules.min}
            max={rules.max}
            step="any"
          />
        );

      case 'currency':
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              value={fieldValue}
              onChange={(e) => handleChange(property.name, parseFloat(e.target.value) || 0)}
              className={`${baseInputClasses} pl-7`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={fieldValue}
            onChange={(e) => handleChange(property.name, e.target.value)}
            className={baseInputClasses}
          />
        );

      case 'boolean':
        return (
          <div className="mt-1">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={fieldValue || false}
                onChange={(e) => handleChange(property.name, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">
                {property.description || 'Enable this option'}
              </span>
            </label>
          </div>
        );

      case 'select':
        const options = rules.options || [];
        return (
          <select
            value={fieldValue}
            onChange={(e) => handleChange(property.name, e.target.value)}
            className={baseInputClasses}
          >
            <option value="">Select an option...</option>
            {options.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={fieldValue}
            onChange={(e) => handleChange(property.name, e.target.value)}
            className={baseInputClasses}
            placeholder={property.description}
          />
        );
    }
  };

  if (!schema?.properties || schema.properties.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No additional properties for this category.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {schema.properties.map((property) => (
        <div key={property.name} className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {property.label}
            {property.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          
          {renderField(property)}
          
          {errors[property.name] && (
            <p className="text-sm text-red-600">
              {errors[property.name]}
            </p>
          )}
          
          {property.description && property.type !== 'boolean' && (
            <p className="text-xs text-gray-500">
              {property.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
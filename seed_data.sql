-- ChoreShare Seed Data
-- Based on cleaning schedule PDF and technical architecture

-- Initial workspace for SLC
INSERT INTO workspaces (id, name, type, settings) VALUES 
(1, 'Kurt & Kaya Household', 'household', '{"timezone": "America/Los_Angeles"}')
ON CONFLICT (id) DO NOTHING;

-- Initial users for SLC
INSERT INTO users (id, first_name, last_name, avatar) VALUES 
(1, 'Kurt', '', '🧑‍🍳'),
(2, 'Kaya', '', '👩‍🍳')
ON CONFLICT (id) DO NOTHING;

-- Workspace membership
INSERT INTO workspace_members (workspace_id, user_id) VALUES 
(1, 1), (1, 2)
ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- Frequency types with proper scheduling strategies (no hardcoding)
INSERT INTO frequency_types (id, name, description, days_interval, scheduling_strategy, scheduling_rule, is_active) VALUES
(1, 'daily', 'Every day', 1, 'fixed_interval', '{}', true),
(2, 'weekly', 'Once per week', 7, 'fixed_interval', '{}', true),
(3, 'biweekly', 'Every two weeks', 14, 'fixed_interval', '{}', true),
(4, 'twice_monthly', 'Twice per month (1st and 15th)', NULL, 'calendar_based', '{"days": [1, 15]}', true),
(5, 'monthly', 'Once per month', 30, 'fixed_interval', '{}', true),
(6, 'quarterly', 'Every three months', 90, 'fixed_interval', '{}', true),
(7, 'onetime', 'One-time task', NULL, 'fixed_interval', '{}', true)
ON CONFLICT (id) DO NOTHING;

-- Global property definitions for reuse
INSERT INTO property_definitions (id, name, type, label, description, validation_rules, is_global) VALUES
(1, 'shared_cost', 'currency', 'Shared Cost', 'Amount to be split between household members', '{"min": 0}', true),
(2, 'store', 'text', 'Store', 'Where the shopping was done', '{"maxLength": 255}', true),
(3, 'receipt_notes', 'textarea', 'Receipt Notes', 'Additional notes about the purchase', '{}', true),
(4, 'last_service', 'date', 'Last Service Date', 'When this was last serviced', '{}', true),
(5, 'next_service', 'date', 'Next Service Due', 'When next service is needed', '{}', true),
(6, 'service_provider', 'text', 'Service Provider', 'Company or person providing service', '{"maxLength": 255}', true),
(7, 'prep_time', 'number', 'Prep Time (minutes)', 'How long this takes to prepare', '{"min": 0}', true),
(8, 'serves', 'number', 'Serves How Many', 'Number of people this serves', '{"min": 1}', true),
(9, 'dietary_notes', 'text', 'Dietary Considerations', 'Special dietary requirements or notes', '{"maxLength": 255}', true),
(10, 'room_location', 'text', 'Room/Area', 'Specific room or area for this task', '{"maxLength": 100}', true),
(11, 'cleaning_supplies', 'text', 'Cleaning Supplies Needed', 'What supplies or tools are needed', '{"maxLength": 255}', true),
(12, 'estimated_time', 'number', 'Estimated Time (minutes)', 'How long this task typically takes', '{"min": 1}', true)
ON CONFLICT (id) DO NOTHING;

-- System categories with property schemas
INSERT INTO categories (id, workspace_id, name, icon, color, property_schema, is_system, created_by) VALUES
(1, 1, 'Shopping', '🛒', '#e74c3c', 
 '{"properties": [{"name": "shared_cost", "required": false}, {"name": "store", "required": false}, {"name": "receipt_notes", "required": false}]}', 
 true, 1),
(2, 1, 'Cleaning', '🧽', '#3498db', 
 '{"properties": [{"name": "room_location", "required": false}, {"name": "cleaning_supplies", "required": false}, {"name": "estimated_time", "required": false}]}', 
 true, 1),
(3, 1, 'Kitchen', '🍽️', '#e67e22', 
 '{"properties": [{"name": "cleaning_supplies", "required": false}, {"name": "estimated_time", "required": false}]}', 
 true, 1),
(4, 1, 'Laundry', '👕', '#9b59b6', 
 '{"properties": [{"name": "estimated_time", "required": false}]}', 
 true, 1),
(5, 1, 'Outdoor', '🌿', '#27ae60', 
 '{"properties": [{"name": "estimated_time", "required": false}]}', 
 true, 1),
(6, 1, 'Pet Care', '🐕', '#f39c12', 
 '{"properties": [{"name": "estimated_time", "required": false}]}', 
 true, 1),
(7, 1, 'Maintenance', '🔧', '#95a5a6', 
 '{"properties": [{"name": "last_service", "required": false}, {"name": "next_service", "required": false}, {"name": "service_provider", "required": false}]}', 
 true, 1),
(8, 1, 'Organization', '📋', '#34495e', 
 '{"properties": [{"name": "room_location", "required": false}, {"name": "estimated_time", "required": false}]}', 
 true, 1)
ON CONFLICT (id) DO NOTHING;

-- DAILY CHORES (from PDF page 2)
INSERT INTO chores (workspace_id, title, short_description, notes, category_id, frequency_type_id, suggested_day_of_week, assigned_to, created_by, status, properties) VALUES
-- Daily Tasks
(1, 'Make Bed', 'Make the bed each morning', '', 2, 1, NULL, 1, 1, 'pending', '{"room_location": "Bedroom", "estimated_time": 5}'),
(1, 'Load/Unload Dishwasher', 'Load dirty dishes and unload clean ones', '', 3, 1, NULL, 2, 1, 'pending', '{"estimated_time": 10}'),
(1, 'Hand Wash Dishes', 'Wash dishes that can''t go in dishwasher', '', 3, 1, NULL, 1, 1, 'pending', '{"cleaning_supplies": "Dish soap, sponge", "estimated_time": 15}'),
(1, 'Empty Dish Drying Rack', 'Put away dishes from drying rack', '', 3, 1, NULL, 2, 1, 'pending', '{"estimated_time": 5}'),
(1, 'Clean Counter with Vinegar', 'Wipe down kitchen counters', '', 3, 1, NULL, 1, 1, 'pending', '{"cleaning_supplies": "Vinegar solution", "estimated_time": 5}'),
(1, 'Clean Sink with Vinegar', 'Clean and shine kitchen sink', '', 3, 1, NULL, 2, 1, 'pending', '{"cleaning_supplies": "Vinegar solution", "estimated_time": 5}'),
(1, 'Coffee + Tea Area Light Clean', 'Tidy up coffee and tea station', '', 3, 1, NULL, 1, 1, 'pending', '{"estimated_time": 5}'),
(1, 'Living + Dining Room Declutter', 'Put away items and tidy up', '', 8, 1, NULL, 2, 1, 'pending', '{"room_location": "Living/Dining", "estimated_time": 10}'),
(1, 'Entryway Declutter', 'Organize shoes, coats, and items', '', 8, 1, NULL, 1, 1, 'pending', '{"room_location": "Entryway", "estimated_time": 5}'),
(1, 'Light Vacuum', 'Quick vacuum of high-traffic areas', '', 2, 1, NULL, 2, 1, 'pending', '{"cleaning_supplies": "Vacuum", "estimated_time": 15}');

-- WEEKLY CHORES (from PDF page 2)
INSERT INTO chores (workspace_id, title, short_description, notes, category_id, frequency_type_id, suggested_day_of_week, assigned_to, created_by, status, properties) VALUES
(1, 'Take Out Trash + Recycling', 'Empty all trash and recycling bins', '', 2, 2, 0, 1, 1, 'pending', '{"estimated_time": 10}'), -- Sunday
(1, 'Trash Bins to Curb', 'Put bins out for pickup and bring back in', '', 2, 2, 1, 2, 1, 'pending', '{"estimated_time": 5}'), -- Monday
(1, 'Wash Dog Bowl', 'Deep clean pet food and water bowls', '', 6, 2, 6, 1, 1, 'pending', '{"cleaning_supplies": "Dish soap", "estimated_time": 5}'), -- Saturday
(1, 'Water Outdoor Plants', 'Water all outdoor plants and garden', '', 5, 2, 6, 2, 1, 'pending', '{"estimated_time": 15}'), -- Saturday
(1, 'Feather Dust Surfaces', 'Dust furniture and surfaces', '', 2, 2, 5, 1, 1, 'pending', '{"cleaning_supplies": "Feather duster", "estimated_time": 20}'), -- Friday
(1, 'Clean Stove', 'Deep clean stovetop and surrounding area', '', 3, 2, 3, 2, 1, 'pending', '{"cleaning_supplies": "Degreaser, scrub brush", "estimated_time": 15}'), -- Wednesday
(1, 'Mop Kitchen', 'Mop kitchen floor thoroughly', '', 3, 2, 4, 1, 1, 'pending', '{"cleaning_supplies": "Mop, floor cleaner", "estimated_time": 15}'), -- Thursday
(1, 'Bathroom Clean', 'Clean both bathrooms thoroughly', 'Clean toilets, sinks, mirrors, floors', 2, 2, 2, 2, 1, 'pending', '{"room_location": "Both bathrooms", "cleaning_supplies": "Bathroom cleaner, toilet brush", "estimated_time": 30}'), -- Tuesday
(1, 'Light Shower Clean', 'Quick clean of shower areas', 'Spray and wipe down shower walls', 2, 2, 4, 1, 1, 'pending', '{"room_location": "Both showers", "cleaning_supplies": "Shower cleaner", "estimated_time": 10}'), -- Thursday
(1, 'Clear Washer + Dryer Area', 'Organize laundry area and surfaces', '', 4, 2, 0, 2, 1, 'pending', '{"room_location": "Laundry room", "estimated_time": 10}'); -- Sunday

-- TWICE-WEEKLY CHORES (from PDF page 2)  
INSERT INTO chores (workspace_id, title, short_description, notes, category_id, frequency_type_id, suggested_day_of_week, assigned_to, created_by, status, properties) VALUES
(1, 'De-fur Couch', 'Remove pet hair from furniture', 'Use lint roller or vacuum attachment', 2, 3, 3, 1, 1, 'pending', '{"cleaning_supplies": "Lint roller or vacuum", "estimated_time": 15}'),
(1, 'Full Vacuum - Bedrooms/Bathrooms', 'Thorough vacuum of all bedrooms and bathrooms', '', 2, 3, 6, 2, 1, 'pending', '{"room_location": "Bedrooms, bathrooms", "cleaning_supplies": "Vacuum", "estimated_time": 25}'),
(1, 'Full Vacuum - Living Room Carpets', 'Deep vacuum of living room carpeted areas', '', 2, 3, 0, 1, 1, 'pending', '{"room_location": "Living room", "cleaning_supplies": "Vacuum", "estimated_time": 20}'),
(1, 'Water Indoor Plants', 'Water all houseplants', '', 5, 3, 4, 2, 1, 'pending', '{"estimated_time": 10}'),
(1, 'Empty Kitty Litter', 'Clean and refresh cat litter box', '', 6, 3, 2, 1, 1, 'pending', '{"cleaning_supplies": "Fresh litter, scoop", "estimated_time": 10}'),
(1, 'Dog Poo Pickup - Front Yard', 'Clean up dog waste from front yard', '', 6, 3, 5, 2, 1, 'pending', '{"room_location": "Front yard", "cleaning_supplies": "Poop bags", "estimated_time": 10}'),
(1, 'Dog Poo Pickup - Back Yard', 'Clean up dog waste from back yard', '', 6, 3, 1, 1, 1, 'pending', '{"room_location": "Back yard", "cleaning_supplies": "Poop bags", "estimated_time": 15}');

-- MONTHLY CHORES (1X PER MONTH from PDF page 1)
INSERT INTO chores (workspace_id, title, short_description, notes, category_id, frequency_type_id, suggested_day_of_week, assigned_to, created_by, status, properties) VALUES
(1, 'Clear and Organize Fridge', 'Remove expired items and organize', 'Check expiration dates, wipe shelves', 3, 5, 0, 1, 1, 'pending', '{"cleaning_supplies": "All-purpose cleaner", "estimated_time": 30}'),
(1, 'Dust All Blinds', 'Clean all window blinds throughout house', '', 2, 5, 6, 2, 1, 'pending', '{"cleaning_supplies": "Microfiber cloth", "estimated_time": 45}'),
(1, 'Print New Chore Chart', 'Update and print monthly chore schedule', '', 8, 5, 0, 1, 1, 'pending', '{"estimated_time": 15}'),
(1, 'Wash Comforter/Duvet', 'Wash all bed comforters and duvets', '', 4, 5, 6, 2, 1, 'pending', '{"cleaning_supplies": "Laundry detergent", "estimated_time": 20}'),
(1, 'Clean Kitchen Plant Ledge', 'Clean and organize kitchen plant area', '', 3, 5, 6, 1, 1, 'pending', '{"room_location": "Kitchen", "cleaning_supplies": "All-purpose cleaner", "estimated_time": 20}'),
(1, 'Wash Kitchen + Mudroom Mats', 'Shake out and wash floor mats', '', 4, 5, 0, 2, 1, 'pending', '{"cleaning_supplies": "Laundry detergent", "estimated_time": 15}');

-- TWICE MONTHLY CHORES (2X PER MONTH from PDF page 1) - Using twice_monthly frequency
INSERT INTO chores (workspace_id, title, short_description, notes, category_id, frequency_type_id, suggested_day_of_week, assigned_to, created_by, status, properties) VALUES
(1, 'Wash Bed Sheets', 'Wash and change all bed sheets', 'Strip beds, wash, and remake with fresh sheets', 4, 4, 0, 1, 1, 'pending', '{"cleaning_supplies": "Laundry detergent", "estimated_time": 45}'),
(1, 'Dining Table Full Clean', 'Deep clean dining table and chairs', 'Polish wood, clean chairs thoroughly', 2, 4, 6, 2, 1, 'pending', '{"room_location": "Dining room", "cleaning_supplies": "Wood polish, all-purpose cleaner", "estimated_time": 25}'),
(1, 'Coffee Table Full Clean', 'Deep clean and organize coffee table', '', 2, 4, 5, 1, 1, 'pending', '{"room_location": "Living room", "cleaning_supplies": "Wood polish", "estimated_time": 15}'),
(1, 'Mop Floor', 'Mop all hard floors throughout house', 'Kitchen, bathrooms, entryway, etc.', 2, 4, 6, 2, 1, 'pending', '{"cleaning_supplies": "Mop, floor cleaner", "estimated_time": 40}'),
(1, 'Deep Clean Bathrooms', 'Thorough deep clean of both bathrooms', 'Scrub tubs, deep clean grout, etc.', 2, 4, 6, 1, 1, 'pending', '{"room_location": "Both bathrooms", "cleaning_supplies": "Bathroom cleaner, scrub brushes", "estimated_time": 60}');

-- QUARTERLY CHORES (4X PER YEAR from PDF page 1)
INSERT INTO chores (workspace_id, title, short_description, notes, category_id, frequency_type_id, suggested_day_of_week, assigned_to, created_by, status, properties) VALUES
(1, 'Wash Pet Bedding', 'Wash all pet beds and blankets', '', 6, 6, 6, 1, 1, 'pending', '{"cleaning_supplies": "Pet-safe detergent", "estimated_time": 30}'),
(1, 'Deep Clean Fridge and Freezer', 'Complete deep clean of refrigerator', 'Remove all items, clean shelves, defrost if needed', 3, 6, 0, 2, 1, 'pending', '{"cleaning_supplies": "Baking soda, all-purpose cleaner", "estimated_time": 90}'),
(1, 'Revisit Garage', 'Organize and clean garage space', 'Declutter, sweep, organize storage', 8, 6, 6, 1, 1, 'pending', '{"room_location": "Garage", "cleaning_supplies": "Broom, organizing bins", "estimated_time": 120}');

-- Set next_due dates for some chores to have immediate tasks
UPDATE chores SET 
  next_due = CURRENT_DATE + INTERVAL '1 day'
WHERE frequency_type_id = 1; -- Daily chores due tomorrow

UPDATE chores SET 
  next_due = CURRENT_DATE + INTERVAL '3 days'  
WHERE frequency_type_id = 2 AND id % 2 = 0; -- Some weekly chores due soon

UPDATE chores SET 
  next_due = CURRENT_DATE + INTERVAL '1 week'
WHERE frequency_type_id = 3 AND id % 3 = 0; -- Some biweekly chores due next week

UPDATE chores SET 
  next_due = CURRENT_DATE + INTERVAL '5 days'
WHERE frequency_type_id = 4 AND id % 4 = 0; -- Some twice-monthly chores due soon

-- Reset sequence counters to continue from inserted IDs
SELECT setval('workspaces_id_seq', (SELECT MAX(id) FROM workspaces));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('frequency_types_id_seq', (SELECT MAX(id) FROM frequency_types));
SELECT setval('property_definitions_id_seq', (SELECT MAX(id) FROM property_definitions));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('chores_id_seq', (SELECT MAX(id) FROM chores));
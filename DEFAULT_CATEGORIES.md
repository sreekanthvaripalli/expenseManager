# Default Categories

When the application boots up, the following 12 categories are automatically created for the demo user:

## Category List

| # | Category Name       | Color Code | Color Preview          | Use Case                          |
|---|---------------------|------------|------------------------|-----------------------------------|
| 1 | Food & Dining       | `#ef4444`  | 🟥 Red                 | Restaurants, takeout, dining out  |
| 2 | Transportation      | `#f59e0b`  | 🟧 Orange              | Gas, parking, public transit      |
| 3 | Shopping            | `#8b5cf6`  | 🟪 Purple              | Clothing, electronics, general    |
| 4 | Entertainment       | `#ec4899`  | 🟪 Pink                | Movies, concerts, subscriptions   |
| 5 | Bills & Utilities   | `#0ea5e9`  | 🟦 Blue                | Electricity, water, internet      |
| 6 | Healthcare          | `#10b981`  | 🟩 Green               | Doctor visits, pharmacy, wellness |
| 7 | Education           | `#6366f1`  | 🟦 Indigo              | Courses, books, tuition           |
| 8 | Travel              | `#14b8a6`  | 🟩 Teal                | Flights, hotels, vacation         |
| 9 | Groceries           | `#84cc16`  | 🟩 Lime                | Supermarket, household supplies   |
| 10| Home & Garden       | `#f97316`  | 🟧 Deep Orange         | Furniture, repairs, plants        |
| 11| Personal Care       | `#a855f7`  | 🟪 Violet              | Haircuts, cosmetics, gym          |
| 12| Gifts & Donations   | `#06b6d4`  | 🟦 Cyan                | Presents, charity, contributions  |

## Implementation

Categories are seeded in `ExpenseManagerApplication.java`:

```java
@Bean
CommandLineRunner seedDemoData(UserRepository userRepository, CategoryRepository categoryRepository) {
    return args -> {
        if (userRepository.count() == 0) {
            User u = new User();
            u.setEmail("demo@example.com");
            u.setFullName("Demo User");
            u.setPasswordHash("demo");
            userRepository.save(u);

            // Create 12 default categories
            createCategory(categoryRepository, u, "Food & Dining", "#ef4444");
            createCategory(categoryRepository, u, "Transportation", "#f59e0b");
            createCategory(categoryRepository, u, "Shopping", "#8b5cf6");
            createCategory(categoryRepository, u, "Entertainment", "#ec4899");
            createCategory(categoryRepository, u, "Bills & Utilities", "#0ea5e9");
            createCategory(categoryRepository, u, "Healthcare", "#10b981");
            createCategory(categoryRepository, u, "Education", "#6366f1");
            createCategory(categoryRepository, u, "Travel", "#14b8a6");
            createCategory(categoryRepository, u, "Groceries", "#84cc16");
            createCategory(categoryRepository, u, "Home & Garden", "#f97316");
            createCategory(categoryRepository, u, "Personal Care", "#a855f7");
            createCategory(categoryRepository, u, "Gifts & Donations", "#06b6d4");
        }
    };
}
```

## Features

- **Auto-populated**: Categories are created automatically when the application starts
- **Distinct Colors**: Each category has a unique, visually distinct color
- **User-specific**: Categories belong to the demo user
- **Customizable**: Users can add, edit, or delete categories through the Settings page
- **Visual Indicators**: Colors appear next to category names throughout the application

## Benefits

1. **Better UX**: Users can start tracking expenses immediately without setup
2. **Visual Organization**: Color-coding makes expenses easy to identify at a glance
3. **Common Use Cases**: Covers the most typical expense categories
4. **Quick Start**: No need to manually create categories before adding expenses
5. **Professional Look**: Application appears complete and polished from the start

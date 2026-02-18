# Default Categories

When a new user registers, the following 12 categories are automatically created for them:

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

Categories are created in `AuthService.java` when a new user registers:

```java
private void createDefaultCategories(User user) {
    createCategory(user, "Food & Dining", "#ef4444");
    createCategory(user, "Transportation", "#f59e0b");
    createCategory(user, "Shopping", "#8b5cf6");
    createCategory(user, "Entertainment", "#ec4899");
    createCategory(user, "Bills & Utilities", "#0ea5e9");
    createCategory(user, "Healthcare", "#10b981");
    createCategory(user, "Education", "#6366f1");
    createCategory(user, "Travel", "#14b8a6");
    createCategory(user, "Groceries", "#84cc16");
    createCategory(user, "Home & Garden", "#f97316");
    createCategory(user, "Personal Care", "#a855f7");
    createCategory(user, "Gifts & Donations", "#06b6d4");
}

private void createCategory(User user, String name, String color) {
    Category category = new Category();
    category.setUser(user);
    category.setName(name);
    category.setColor(color);
    categoryRepository.save(category);
}
```

## Features

- **Auto-populated**: Categories are created automatically when a user registers
- **Distinct Colors**: Each category has a unique, visually distinct color
- **User-specific**: Categories belong to each registered user
- **Customizable**: Users can add, edit, or delete categories through the Settings page
- **Visual Indicators**: Colors appear next to category names throughout the application

## Benefits

1. **Better UX**: Users can start tracking expenses immediately without setup
2. **Visual Organization**: Color-coding makes expenses easy to identify at a glance
3. **Common Use Cases**: Covers the most typical expense categories
4. **Quick Start**: No need to manually create categories before adding expenses
5. **Professional Look**: Application appears complete and polished from the start

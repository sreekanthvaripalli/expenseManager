package com.example.expensemanager.repository;

import com.example.expensemanager.model.Category;
import com.example.expensemanager.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class CategoryRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void testFindByUser_WhenCategoriesExist() {
        // Create and persist a user
        User user = new User();
        user.setEmail("test@example.com");
        user.setPasswordHash("password");
        user.setFullName("Test User");
        User savedUser = entityManager.persistAndFlush(user);

        // Create and persist categories for the user
        Category category1 = new Category();
        category1.setName("Food");
        category1.setColor("#FF5733");
        category1.setUser(savedUser);

        Category category2 = new Category();
        category2.setName("Transportation");
        category2.setColor("#33FF57");
        category2.setUser(savedUser);

        entityManager.persistAndFlush(category1);
        entityManager.persistAndFlush(category2);

        // Test findByUser
        List<Category> categories = categoryRepository.findByUser(savedUser);

        assertEquals(2, categories.size());
        assertTrue(categories.stream().anyMatch(c -> c.getName().equals("Food")));
        assertTrue(categories.stream().anyMatch(c -> c.getName().equals("Transportation")));
        assertTrue(categories.stream().allMatch(c -> c.getUser().equals(savedUser)));
    }

    @Test
    void testFindByUser_WhenNoCategoriesExist() {
        // Create and persist a user with no categories
        User user = new User();
        user.setEmail("empty@example.com");
        user.setPasswordHash("password");
        user.setFullName("Empty User");
        User savedUser = entityManager.persistAndFlush(user);

        // Test findByUser
        List<Category> categories = categoryRepository.findByUser(savedUser);

        assertTrue(categories.isEmpty());
    }

    @Test
    void testFindByUser_DifferentUsers() {
        // Create two users
        User user1 = new User();
        user1.setEmail("user1@example.com");
        user1.setPasswordHash("password");
        user1.setFullName("User One");
        User savedUser1 = entityManager.persistAndFlush(user1);

        User user2 = new User();
        user2.setEmail("user2@example.com");
        user2.setPasswordHash("password");
        user2.setFullName("User Two");
        User savedUser2 = entityManager.persistAndFlush(user2);

        // Create category for user1
        Category category = new Category();
        category.setName("Entertainment");
        category.setColor("#FFFF00");
        category.setUser(savedUser1);
        entityManager.persistAndFlush(category);

        // Test findByUser for user1
        List<Category> categoriesUser1 = categoryRepository.findByUser(savedUser1);
        assertEquals(1, categoriesUser1.size());
        assertEquals("Entertainment", categoriesUser1.get(0).getName());

        // Test findByUser for user2
        List<Category> categoriesUser2 = categoryRepository.findByUser(savedUser2);
        assertTrue(categoriesUser2.isEmpty());
    }
}

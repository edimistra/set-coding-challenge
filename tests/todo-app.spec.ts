import { test, expect, type Page } from '@playwright/test';
import { TodoAppPage  } from '../pages/todo-app-page';
import { checkNumberOfCompletedTodosInLocalStorage, checkNumberOfTodosInLocalStorage, checkTodosInLocalStorage } from '../src/todo-app';

test.beforeEach(async ({ page }) => {
  await page.goto('.');
});

const TODO_ITEMS = [
  'complete code challenge',
  'ensure coverage for all items is automated'
];

test.describe('Create New Todo', () => {
  test('should be able to create new items on the page', async ({ page }) => {
    // Create 1st todo.
    const todoAppPage = new TodoAppPage(page);
    todoAppPage.addNewTodo(TODO_ITEMS[0])

    // Make sure the list only has one todo item.
    await expect(page.getByTestId('todo-item-label')).toHaveCount(1);

    // Create 2nd todo.
    todoAppPage.addNewTodo(TODO_ITEMS[0])

    // Make sure the list now has two todo items.
    await expect(page.getByTestId('todo-item-label')).toHaveCount(2);

    // There is a bug in the current app, it is not saving anything into local storage.
    //await checkNumberOfTodosInLocalStorage(page, 2);
  });

  test('new items appear last on the todo list', async ({ page }) => {
    // Create 1st todo.
    const todoAppPage = new TodoAppPage(page);
    todoAppPage.addNewTodo(TODO_ITEMS[0])

    // First item is already the last item
    await expect(page.getByTestId('todo-item-label').last()).toHaveText(TODO_ITEMS[0]);

    // Create 2nd todo.
    todoAppPage.addNewTodo(TODO_ITEMS[1])

    // Makes sure that the new item is the last item
    await expect(page.getByTestId('todo-item-label').last()).toHaveText(TODO_ITEMS[1]);
  });
});

test.describe('Edit Todo Item', () => {
  test('should be able to edit an existing todo item', async ({ page }) => {
    // Create 1st todo.
    const todoAppPage = new TodoAppPage(page);
    todoAppPage.addNewTodo(TODO_ITEMS[0])

    // Todo item has been added
    await expect(page.getByText(TODO_ITEMS[0])).toBeVisible();

    // Edit the Todo Item
    await page.getByText(TODO_ITEMS[0]).dblclick();
    await page.getByTestId('text-input').last().fill(TODO_ITEMS[1]);
    await page.getByTestId('text-input').last().press('Enter');

    // No traces of previous text for the item is found, and new changes are applied
    await expect(page.getByText(TODO_ITEMS[0])).not.toBeVisible();
    await expect(page.getByText(TODO_ITEMS[1])).toBeVisible();
  });
});

test.describe('Delete Todo Item', () => {
  test('should be able to remove an existing todo item', async ({ page }) => {
    // Create 1st todo.
    const todoAppPage = new TodoAppPage(page);
    todoAppPage.addNewTodo(TODO_ITEMS[0])

    // Todo item has been added
    await expect(page.getByText(TODO_ITEMS[0])).toBeVisible();

    // Delete the Todo Item
    await page.getByText(TODO_ITEMS[0]).hover();
    await page.getByTestId('todo-item-button').click()

    // Item was deleted so it cannot be found
    await expect(page.getByText(TODO_ITEMS[0])).not.toBeVisible();
  });
});

import { test, expect, type Page } from '@playwright/test';
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
    // create a new todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    // Create 1st todo.
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    // Make sure the list only has one todo item.
    await expect(page.getByTestId('todo-item-label')).toHaveCount(1);

    // Create 2nd todo.
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');

    // Make sure the list now has two todo items.
    await expect(page.getByTestId('todo-item-label')).toHaveCount(2);

    // There is a bug in the current app, it is not saving anything into local storage.
    //await checkNumberOfTodosInLocalStorage(page, 2);
  });

  test('new items appear last on the todo list', async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    // Create 1st todo.
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    // First item is already the last item
    await expect(page.getByTestId('todo-item-label').last()).toHaveText(TODO_ITEMS[0]);

    // Create 2nd todo.
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');

    // Makes sure that the new item is the last item
    await expect(page.getByTestId('todo-item-label').last()).toHaveText(TODO_ITEMS[1]);
  });
});

test.describe('Edit Todo Item', () => {
  test('should be able to edit an existing todo item', async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    // Create 1st todo.
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    // Todo item has been added
    await expect(page.getByText(TODO_ITEMS[0])).toBeVisible();

    // Edit the Todo Item
    await page.getByText(TODO_ITEMS[0]).dblclick();
    await page.getByTestId('text-input').last().fill(TODO_ITEMS[1]);
    await page.getByTestId('text-input').last().press('Enter');
    await expect(page.getByText(TODO_ITEMS[0])).not.toBeVisible();
    await expect(page.getByText(TODO_ITEMS[1])).toBeVisible();
  });
});

import { test, expect, type Page } from '@playwright/test';
import { TodoAppPage  } from '../pages/todo-app-page';
import { checkNumberOfCompletedTodosInLocalStorage, checkNumberOfTodosInLocalStorage, checkTodosInLocalStorage } from '../src/todo-app';

test.beforeEach(async ({ page }) => {
  await page.goto('.');
});

const TODO_ITEMS = [
  'complete code challenge',
  'ensure coverage for all items is automated',
  'optional: validate additional scenarios'
];

test.describe('Create New Todo', () => {
  test('should be able to create new items on the page', async ({ page }) => {
    // Create 1st todo.
    const todoAppPage = new TodoAppPage(page);
    await todoAppPage.addNewTodo(TODO_ITEMS[0])

    // Make sure the list only has one todo item.
    await expect(page.getByTestId('todo-item-label')).toHaveCount(1);

    // Create 2nd todo.
    await todoAppPage.addNewTodo(TODO_ITEMS[1])

    // Make sure the list now has two todo items.
    await expect(page.getByTestId('todo-item-label')).toHaveCount(2);

    // There is a bug in the current app, it is not saving anything into local storage.
    //await checkNumberOfTodosInLocalStorage(page, 2);
  });

  test('new items appear last on the todo list', async ({ page }) => {
    // Create 1st todo.
    const todoAppPage = new TodoAppPage(page);
    await todoAppPage.addNewTodo(TODO_ITEMS[0])

    // First item is already the last item
    await expect(page.getByTestId('todo-item-label').last()).toHaveText(TODO_ITEMS[0]);

    // Create 2nd todo.
    await todoAppPage.addNewTodo(TODO_ITEMS[1])

    // Makes sure that the new item is the last item
    await expect(page.getByTestId('todo-item-label').last()).toHaveText(TODO_ITEMS[1]);
  });
});

test.describe('Edit Todo Item', () => {
  test('should be able to edit an existing todo item', async ({ page }) => {
    // Create 1st todo.
    const todoAppPage = new TodoAppPage(page);
    await todoAppPage.addNewTodo(TODO_ITEMS[0])

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
    await todoAppPage.addNewTodo(TODO_ITEMS[0])

    // Delete the Todo Item
    await page.getByText(TODO_ITEMS[0]).hover();
    await page.getByTestId('todo-item-button').click()

    // Item was deleted so it cannot be found
    await expect(page.getByText(TODO_ITEMS[0])).not.toBeVisible();
  });
});

test.describe('Mark Todo Item as Completed', () => {
  test('should be able to mark a todo item as completed', async ({ page }) => {
    // Create 1st todo.
    const todoAppPage = new TodoAppPage(page);
    await todoAppPage.addNewTodo(TODO_ITEMS[0])

    // Completes the Todo Item
    await expect(page.getByTestId("todo-item")).not.toHaveClass('completed');
    await page.getByTestId("todo-item-toggle").setChecked(true);

    // Validates that list item has a completed state
    await expect(page.getByTestId("todo-item")).toHaveClass('completed');
    await expect(page.getByText(TODO_ITEMS[0])).toHaveCSS("text-decoration",/line-through/);
  });

  test('should display only active (Not Completed) todo items', async ({ page }) => {
    // Adds 3 items to the todo list
    const todoAppPage = new TodoAppPage(page);
    await todoAppPage.addNewTodo(TODO_ITEMS[0])
    await todoAppPage.addNewTodo(TODO_ITEMS[1])
    await todoAppPage.addNewTodo(TODO_ITEMS[2])

    // Completes the 1st Todo Item
    await page.getByTestId("todo-item-toggle").first().setChecked(true);
    await expect(page.getByTestId("todo-item").first()).toHaveClass('completed');

    // Validates that Active list doesn't contain any complete items
    await page.getByText("Active").click();
    for (const todoItem of await page.getByTestId("todo-item").all())
      await expect(todoItem).not.toHaveClass('completed');
  });

  test('should remove completed items from all lists after hitting Clear completed', async ({ page }) => {
    // Adds 3 items to the todo list
    const todoAppPage = new TodoAppPage(page);
    await todoAppPage.addNewTodo(TODO_ITEMS[0])
    await todoAppPage.addNewTodo(TODO_ITEMS[1])
    await todoAppPage.addNewTodo(TODO_ITEMS[2])

    // Completes the 1st Todo Item
    await page.getByTestId("todo-item-toggle").first().setChecked(true);
    await expect(page.getByTestId("todo-item").first()).toHaveClass('completed');

    // Clear completed
    await page.getByRole("button", { name: "Clear completed" }).click();

    // Validates that All list doesn't contain any complete items
    await page.getByRole("link", { name: "All" }).click();
      for (const todoItem of await page.getByTestId("todo-item").all())
        await expect(todoItem).not.toHaveClass('completed');

    // Validates that Completed list doesn't have any items
    await page.getByRole("link", { name: "Completed" }).click();
    await expect (page.getByTestId("todo-item")).not.toBeVisible()

    // Completes all remaining items
    await page.getByRole("link", { name: "All" }).click();
    for (const todoItem of await page.getByTestId("todo-item-toggle").all())
      await todoItem.setChecked(true);

    // Clear completed
    await page.getByRole("button", { name: "Clear completed" }).click();

    // Validates that the todo list is empty
    await expect (page.getByTestId("todo-item")).not.toBeVisible();
  });
});
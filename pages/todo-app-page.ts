import { type Locator, type Page } from '@playwright/test';

export class TodoAppPage {
    readonly page: Page;
    readonly todoInput: Locator;

    constructor(page: Page) {
        this.page = page;
        this.todoInput = page.getByPlaceholder('What needs to be done?');
    }

    async addNewTodo(todoItem: string) {
        await this.todoInput.fill(todoItem);
        await this.todoInput.press('Enter');
    }
}
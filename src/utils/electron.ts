import type { Customer, Product, Payment } from '../types';

class Database {
  private isElectron: boolean;

  constructor() {
    this.isElectron = typeof window !== 'undefined' && 'electron' in window;
  }

  async getAll(key: string): Promise<any[]> {
    if (!this.isElectron) return [];
    try {
      return await window.electron.db.getAll(key);
    } catch (error) {
      console.error(`Error getting data from ${key}:`, error);
      return [];
    }
  }

  async insert(key: string, data: any): Promise<boolean> {
    if (!this.isElectron) return false;
    try {
      return await window.electron.db.insert(key, data);
    } catch (error) {
      console.error(`Error inserting data to ${key}:`, error);
      return false;
    }
  }

  async delete(key: string, id: string): Promise<boolean> {
    if (!this.isElectron) return false;
    try {
      return await window.electron.db.delete(key, id);
    } catch (error) {
      console.error(`Error deleting data from ${key}:`, error);
      return false;
    }
  }

  async backup(filePath: string): Promise<boolean> {
    if (!this.isElectron) return false;
    try {
      return await window.electron.backup.create();
    } catch (error) {
      console.error('Error creating backup:', error);
      return false;
    }
  }

  async restore(filePath: string): Promise<boolean> {
    if (!this.isElectron) return false;
    try {
      return await window.electron.backup.restore(filePath);
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }
}

export const db = new Database();
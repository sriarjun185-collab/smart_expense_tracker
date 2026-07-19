const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Helper to ensure data directory exists and returns parsed JSON array
const getCollection = (filename) => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}, resetting...`, error);
    return [];
  }
};

// Helper to save data back to JSON file
const saveCollection = (filename, data) => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

const mockDb = {
  // --- USERS ---
  getUsers: () => getCollection('users.json'),
  saveUsers: (users) => saveCollection('users.json', users),
  
  findUserByEmail: (email) => {
    const users = mockDb.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  
  findUserById: (id) => {
    const users = mockDb.getUsers();
    return users.find(u => u._id === id);
  },
  
  createUser: (userData) => {
    const users = mockDb.getUsers();
    const newUser = {
      _id: Date.now().toString(),
      ...userData,
      monthlyBudgetLimit: userData.monthlyBudgetLimit || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    mockDb.saveUsers(users);
    return newUser;
  },
  
  updateUser: (id, updates) => {
    const users = mockDb.getUsers();
    const index = users.findIndex(u => u._id === id);
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    mockDb.saveUsers(users);
    return users[index];
  },
  
  deleteUser: (id) => {
    let users = mockDb.getUsers();
    users = users.filter(u => u._id !== id);
    mockDb.saveUsers(users);
    
    // Cascading delete for user data
    let expenses = mockDb.getExpenses();
    expenses = expenses.filter(e => e.user !== id);
    mockDb.saveExpenses(expenses);
    
    let incomes = mockDb.getIncomes();
    incomes = incomes.filter(i => i.user !== id);
    mockDb.saveIncomes(incomes);
    
    return true;
  },

  // --- EXPENSES ---
  getExpenses: () => getCollection('expenses.json'),
  saveExpenses: (expenses) => saveCollection('expenses.json', expenses),
  
  createExpense: (expenseData) => {
    const expenses = mockDb.getExpenses();
    const newExpense = {
      _id: Date.now().toString(),
      ...expenseData,
      amount: Number(expenseData.amount),
      date: expenseData.date ? new Date(expenseData.date).toISOString() : new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    expenses.push(newExpense);
    mockDb.saveExpenses(expenses);
    return newExpense;
  },
  
  updateExpense: (id, userId, updates) => {
    const expenses = mockDb.getExpenses();
    const index = expenses.findIndex(e => e._id === id && e.user === userId);
    if (index === -1) return null;
    
    expenses[index] = {
      ...expenses[index],
      ...updates,
      amount: updates.amount !== undefined ? Number(updates.amount) : expenses[index].amount,
      date: updates.date ? new Date(updates.date).toISOString() : expenses[index].date,
      updatedAt: new Date().toISOString()
    };
    mockDb.saveExpenses(expenses);
    return expenses[index];
  },
  
  deleteExpense: (id, userId) => {
    let expenses = mockDb.getExpenses();
    const index = expenses.findIndex(e => e._id === id && e.user === userId);
    if (index === -1) return false;
    
    expenses.splice(index, 1);
    mockDb.saveExpenses(expenses);
    return true;
  },

  // --- INCOMES ---
  getIncomes: () => getCollection('incomes.json'),
  saveIncomes: (incomes) => saveCollection('incomes.json', incomes),
  
  createIncome: (incomeData) => {
    const incomes = mockDb.getIncomes();
    const newIncome = {
      _id: Date.now().toString(),
      ...incomeData,
      amount: Number(incomeData.amount),
      date: incomeData.date ? new Date(incomeData.date).toISOString() : new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    incomes.push(newIncome);
    mockDb.saveIncomes(incomes);
    return newIncome;
  },
  
  updateIncome: (id, userId, updates) => {
    const incomes = mockDb.getIncomes();
    const index = incomes.findIndex(i => i._id === id && i.user === userId);
    if (index === -1) return null;
    
    incomes[index] = {
      ...incomes[index],
      ...updates,
      amount: updates.amount !== undefined ? Number(updates.amount) : incomes[index].amount,
      date: updates.date ? new Date(updates.date).toISOString() : incomes[index].date,
      updatedAt: new Date().toISOString()
    };
    mockDb.saveIncomes(incomes);
    return incomes[index];
  },
  
  deleteIncome: (id, userId) => {
    let incomes = mockDb.getIncomes();
    const index = incomes.findIndex(i => i._id === id && i.user === userId);
    if (index === -1) return false;
    
    incomes.splice(index, 1);
    mockDb.saveIncomes(incomes);
    return true;
  }
};

module.exports = mockDb;

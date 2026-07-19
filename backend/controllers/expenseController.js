const Expense = require('../models/Expense');
const mockDb = require('../config/mockDb');

// @desc    Get all expenses with search, filters, sorting & pagination
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { category, search, startDate, endDate, sortBy, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (global.useMockDb) {
      let expenses = mockDb.getExpenses().filter(e => e.user === req.user._id);

      // Filtering
      if (category) {
        expenses = expenses.filter(e => e.category.toLowerCase() === category.toLowerCase());
      }

      if (search) {
        const s = search.toLowerCase();
        expenses = expenses.filter(e => 
          (e.title && e.title.toLowerCase().includes(s)) ||
          (e.description && e.description.toLowerCase().includes(s)) ||
          (e.category && e.category.toLowerCase().includes(s))
        );
      }

      if (startDate) {
        const start = new Date(startDate);
        expenses = expenses.filter(e => new Date(e.date) >= start);
      }

      if (endDate) {
        const end = new Date(endDate);
        expenses = expenses.filter(e => new Date(e.date) <= end);
      }

      // Sorting
      if (sortBy === 'oldest') {
        expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sortBy === 'amount_asc') {
        expenses.sort((a, b) => a.amount - b.amount);
      } else if (sortBy === 'amount_desc') {
        expenses.sort((a, b) => b.amount - a.amount);
      } else {
        // default: newest
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      }

      const total = expenses.length;
      const paginatedExpenses = expenses.slice(skip, skip + Number(limit));

      return res.json({
        success: true,
        count: paginatedExpenses.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        expenses: paginatedExpenses
      });
    } else {
      // Mongoose database
      const query = { user: req.user._id };

      if (category) {
        query.category = category;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      // Sort setup
      let sortOpt = { date: -1 };
      if (sortBy === 'oldest') sortOpt = { date: 1 };
      else if (sortBy === 'amount_asc') sortOpt = { amount: 1 };
      else if (sortBy === 'amount_desc') sortOpt = { amount: -1 };

      const total = await Expense.countDocuments(query);
      const expenses = await Expense.find(query)
        .sort(sortOpt)
        .skip(skip)
        .limit(Number(limit));

      return res.json({
        success: true,
        count: expenses.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        expenses
      });
    }
  } catch (error) {
    console.error('Get Expenses Error:', error);
    res.status(500).json({ success: false, message: 'Server error, could not fetch expenses' });
  }
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({ success: false, message: 'Title, amount, and category are required' });
    }

    if (global.useMockDb) {
      const expense = mockDb.createExpense({
        user: req.user._id,
        title,
        amount,
        category,
        date,
        description
      });
      return res.status(201).json({ success: true, expense });
    } else {
      const expense = await Expense.create({
        user: req.user._id,
        title,
        amount,
        category,
        date,
        description
      });
      return res.status(201).json({ success: true, expense });
    }
  } catch (error) {
    console.error('Create Expense Error:', error);
    res.status(500).json({ success: false, message: 'Server error, could not create expense' });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    if (global.useMockDb) {
      const updatedExpense = mockDb.updateExpense(req.params.id, req.user._id, {
        title,
        amount,
        category,
        date,
        description
      });

      if (!updatedExpense) {
        return res.status(404).json({ success: false, message: 'Expense not found' });
      }

      return res.json({ success: true, expense: updatedExpense });
    } else {
      let expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

      if (!expense) {
        return res.status(404).json({ success: false, message: 'Expense not found' });
      }

      expense.title = title !== undefined ? title : expense.title;
      expense.amount = amount !== undefined ? amount : expense.amount;
      expense.category = category !== undefined ? category : expense.category;
      expense.date = date !== undefined ? date : expense.date;
      expense.description = description !== undefined ? description : expense.description;

      const updatedExpense = await expense.save();
      return res.json({ success: true, expense: updatedExpense });
    }
  } catch (error) {
    console.error('Update Expense Error:', error);
    res.status(500).json({ success: false, message: 'Server error, could not update expense' });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    if (global.useMockDb) {
      const success = mockDb.deleteExpense(req.params.id, req.user._id);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Expense not found' });
      }
      return res.json({ success: true, message: 'Expense removed' });
    } else {
      const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

      if (!expense) {
        return res.status(404).json({ success: false, message: 'Expense not found' });
      }

      await expense.deleteOne();
      return res.json({ success: true, message: 'Expense removed' });
    }
  } catch (error) {
    console.error('Delete Expense Error:', error);
    res.status(500).json({ success: false, message: 'Server error, could not delete expense' });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
};

const Income = require('../models/Income');
const mockDb = require('../config/mockDb');

// @desc    Get all incomes with search, filters, sorting & pagination
// @route   GET /api/incomes
// @access  Private
const getIncomes = async (req, res) => {
  try {
    const { search, startDate, endDate, sortBy, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (global.useMockDb) {
      let incomes = mockDb.getIncomes().filter(i => i.user === req.user._id);

      // Filtering
      if (search) {
        const s = search.toLowerCase();
        incomes = incomes.filter(i => 
          (i.source && i.source.toLowerCase().includes(s)) ||
          (i.description && i.description.toLowerCase().includes(s))
        );
      }

      if (startDate) {
        const start = new Date(startDate);
        incomes = incomes.filter(i => new Date(i.date) >= start);
      }

      if (endDate) {
        const end = new Date(endDate);
        incomes = incomes.filter(i => new Date(i.date) <= end);
      }

      // Sorting
      if (sortBy === 'oldest') {
        incomes.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sortBy === 'amount_asc') {
        incomes.sort((a, b) => a.amount - b.amount);
      } else if (sortBy === 'amount_desc') {
        incomes.sort((a, b) => b.amount - a.amount);
      } else {
        // default: newest
        incomes.sort((a, b) => new Date(b.date) - new Date(a.date));
      }

      const total = incomes.length;
      const paginatedIncomes = incomes.slice(skip, skip + Number(limit));

      return res.json({
        success: true,
        count: paginatedIncomes.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        incomes: paginatedIncomes
      });
    } else {
      // Mongoose database
      const query = { user: req.user._id };

      if (search) {
        query.$or = [
          { source: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
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

      const total = await Income.countDocuments(query);
      const incomes = await Income.find(query)
        .sort(sortOpt)
        .skip(skip)
        .limit(Number(limit));

      return res.json({
        success: true,
        count: incomes.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        incomes
      });
    }
  } catch (error) {
    console.error('Get Incomes Error:', error);
    res.status(500).json({ success: false, message: 'Server error, could not fetch incomes' });
  }
};

// @desc    Create a new income
// @route   POST /api/incomes
// @access  Private
const createIncome = async (req, res) => {
  try {
    const { amount, source, date, description } = req.body;

    if (!amount || !source) {
      return res.status(400).json({ success: false, message: 'Amount and source are required' });
    }

    if (global.useMockDb) {
      const income = mockDb.createIncome({
        user: req.user._id,
        amount,
        source,
        date,
        description
      });
      return res.status(201).json({ success: true, income });
    } else {
      const income = await Income.create({
        user: req.user._id,
        amount,
        source,
        date,
        description
      });
      return res.status(201).json({ success: true, income });
    }
  } catch (error) {
    console.error('Create Income Error:', error);
    res.status(500).json({ success: false, message: 'Server error, could not create income' });
  }
};

// @desc    Update an income
// @route   PUT /api/incomes/:id
// @access  Private
const updateIncome = async (req, res) => {
  try {
    const { amount, source, date, description } = req.body;

    if (global.useMockDb) {
      const updatedIncome = mockDb.updateIncome(req.params.id, req.user._id, {
        amount,
        source,
        date,
        description
      });

      if (!updatedIncome) {
        return res.status(404).json({ success: false, message: 'Income not found' });
      }

      return res.json({ success: true, income: updatedIncome });
    } else {
      let income = await Income.findOne({ _id: req.params.id, user: req.user._id });

      if (!income) {
        return res.status(404).json({ success: false, message: 'Income not found' });
      }

      income.amount = amount !== undefined ? amount : income.amount;
      income.source = source !== undefined ? source : income.source;
      income.date = date !== undefined ? date : income.date;
      income.description = description !== undefined ? description : income.description;

      const updatedIncome = await income.save();
      return res.json({ success: true, income: updatedIncome });
    }
  } catch (error) {
    console.error('Update Income Error:', error);
    res.status(500).json({ success: false, message: 'Server error, could not update income' });
  }
};

// @desc    Delete an income
// @route   DELETE /api/incomes/:id
// @access  Private
const deleteIncome = async (req, res) => {
  try {
    if (global.useMockDb) {
      const success = mockDb.deleteIncome(req.params.id, req.user._id);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Income not found' });
      }
      return res.json({ success: true, message: 'Income removed' });
    } else {
      const income = await Income.findOne({ _id: req.params.id, user: req.user._id });

      if (!income) {
        return res.status(404).json({ success: false, message: 'Income not found' });
      }

      await income.deleteOne();
      return res.json({ success: true, message: 'Income removed' });
    }
  } catch (error) {
    console.error('Delete Income Error:', error);
    res.status(500).json({ success: false, message: 'Server error, could not delete income' });
  }
};

module.exports = {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome
};

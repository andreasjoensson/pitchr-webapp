const models = require("../models");
const Metric = models.Metric;
const Row = models.Row;

const getFinancialData = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await Metric.findAll({
      where: {
        userId: id,
      },
      include: [
        {
          model: Row,
          as: "rows",
        },
      ],
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

const createFinancial = async (req, res) => {
  const { id } = req.params;
  const { name, rows } = req.body;

  try {
    const metricObj = await Metric.create({ name: name, userId: id });
    await Promise.all(
      rows.map(async (row, index) => {
        await Row.create({
          month: row.month,
          amount: row.amount,
          metricId: metricObj.id,
          index: index,
        });
      })
    );
    res.status(200).json("Data has been uploaded");
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteFinancial = async (req, res) => {
  const { id } = req.params;

  try {
    Metric.destroy({ where: { id: id } });
    res.status(200).json("Data has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = { createFinancial, deleteFinancial, getFinancialData };

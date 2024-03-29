"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PitchDeck extends Model {
    static associate(models) {
      this.belongsTo(models.Business, { foreignKey: "userId" });
      this.hasMany(models.PitchDeckFile, {
        foreignKey: "pitchDeckId",
        as: "pitchDeckFiles",
      });
    }
  }

  PitchDeck.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "PitchDeck",
    }
  );

  return PitchDeck;
};

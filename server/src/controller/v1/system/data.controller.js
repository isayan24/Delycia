import dataModel from "../../../models/v1/system/data.model.js";

const fetchUpsellItems = async (req, res) => {
  const response = await dataModel.fetchUpsellItems();
};

export default { fetchUpsellItems };

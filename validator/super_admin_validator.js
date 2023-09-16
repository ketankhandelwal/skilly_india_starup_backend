const Yup = require("yup");

const collectionDetails = Yup.object().shape({
  year: Yup.number().optional(),
  month: Yup.number().optional(),
  skill_id: Yup.number().optional(),
});
module.exports = {
  collectionDetails,
};

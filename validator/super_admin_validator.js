const Yup = require("yup");

const collectionDetails = Yup.object().shape({
  year: Yup.number().optional(),
  month: Yup.number().optional(),
  skillGraph: Yup.number().optional().min(0).max(1),
  classGraph: Yup.number().optional().min(0).max(1),
});
module.exports = {
  collectionDetails,
};

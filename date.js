// jshint esversion:6

// not in use

exports.getDay = function () {
  const today = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  const day = today.toLocaleDateString("en-US", options);
  return day;
};

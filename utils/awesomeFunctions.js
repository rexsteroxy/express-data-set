exports.isEmpty = (obj) => {
  // null and undefined are "empty"
  if (obj == null) return true;

  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;

  // If it isn't an object at this point
  // it is empty, but it can't be anything *but* empty
  // Is it empty?  Depends on your application.
  if (typeof obj !== 'object') return true;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9

  // I will resolve this wahala later abeg
  for (let key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
};

exports.extract = (firstArray) => {
  return firstArray.map((el) => {
    return Object.keys(el)[0];
  });
};



exports.calculatePercent = (finalArray) => {
    const result = this.extract(finalArray);
    let sum = 0;
    let percent = 0;
    let count = 0;
    finalArray.forEach((el, index) => {
      const item = result[index];
      sum += el[item];
      percent += el.percent;
      count += 1;
    });
    const average = sum / count;
    const resultData = {
      totalScore: sum,
      totalScorePercent: percent,
      totalScoreAverage: average,
    };
  
    return resultData;
  }


  exports.removeDoubleQuotes = (str) => {
    if (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"') {
      return str.substr(1, str.length - 2);
    }
    return str;
  };

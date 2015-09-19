import R from "ramda";
import crypto from "crypto";


const compact = R.pipe(R.flatten, R.reject(R.isNil));
const toStringArray = R.pipe(compact, R.map(R.toString));


/**
 * Turns a set of values into a HEX hash code.
 * @param values: The set of values to hash.
 */
const hash = (...values) => {
  if (R.pipe(compact, R.isEmpty)(values)) { return; }
  const hash = crypto.createHash("md5")
  const addValue = value => hash.update(value);
  const addValues = R.forEach(addValue);
  R.pipe(
    toStringArray,
    addValues
  )(values)
  return hash.digest("hex")
};



export default { hash };

import Register from "./Register.js";
import Login from "./Login.js";
import { fetchLicense, validateLicense } from "./keygen.js";

const license = { fetch: fetchLicense, validate: validateLicense };

export { Register, Login, license };

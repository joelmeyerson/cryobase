import Register from "./account/Register.js";
import Login from "./account/Login.js";

import { fetchLicense, validateLicense } from "./account/keygen.js";

const license = { fetch: fetchLicense, validate: validateLicense };

export { Register, Login, license };

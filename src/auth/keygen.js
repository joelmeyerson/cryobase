import { UUID, policyid } from "./config.js";

export async function validateUser(email, password) {
  const credentials = btoa(`${email}:${password}`);
  const response = await fetch(
    `https://api.keygen.sh/v1/accounts/${UUID}/tokens`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
        Authorization: `Basic ${credentials}`,
      },
    }
  );
  const { data, errors } = await response.json();
  return [data, errors];
}

export async function fetchLicense(token) {
  const response = await fetch(
    `https://api.keygen.sh/v1/accounts/${UUID}/licenses?limit=1`,
    {
      method: "GET",
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const { data, errors } = await response.json();
  return [data, errors];
}

export async function validateLicense(token, licenseid) {
  const response = await fetch(
    `https://api.keygen.sh/v1/accounts/${UUID}/licenses/${licenseid}/actions/validate`,
    {
      method: "GET",
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const { meta, data, errors } = await response.json();
  return [meta, data, errors];
}

export async function registerUser(firstName, lastName, email, password) {
  const response = await fetch(
    `https://api.keygen.sh/v1/accounts/${UUID}/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "users",
          attributes: {
            firstName,
            lastName,
            email,
            password,
          },
        },
      }),
    }
  );
  const { data, errors } = await response.json();
  return [data, errors];
}

export async function createUserToken(email, password) {
  const credentials = Buffer.from(`${email}:${password}`).toString("base64"); // Generate user token
  const response = await fetch(
    `https://api.keygen.sh/v1/accounts/${UUID}/tokens`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Basic ${credentials}`,
      },
    }
  );
  const { data, errors } = await response.json();
  return [data, errors];
}

export async function createLicense(type, id, token) {
  const response = await fetch(
    `https://api.keygen.sh/v1/accounts/${UUID}/licenses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          type: "licenses",
          relationships: {
            policy: {
              data: { type: "policies", id: policyid },
            },
            user: {
              data: { type: type, id: id },
            },
          },
        },
      }),
    }
  );
  const { data, errors } = await response.json();
  return [data, errors];
}

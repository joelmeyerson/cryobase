import React, { useState, useEffect } from "react";
import { Form, Input, Button, Checkbox, Card } from "antd";
import {
  UserOutlined,
  LockOutlined,
  KeyOutlined,
  MailOutlined,
} from "@ant-design/icons";

const UUID = "745f500a-8b4e-4974-a5f4-54c2ebb2f70f";
const policyid = "00d4d03c-cffb-4212-bd91-919baefe21dc";

export default function Authentication(props) {
  const [form] = Form.useForm(); // Create ANTD form
  const [loginState, setLoginState] = useState("login"); // Toggles between "login" and "register"

  async function validateUser(values) {
    const credentials = btoa(`${values.email}:${values.password}`);
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
    const { data: token, errors } = await response.json();
    if (errors) {
      console.log(errors);
    }
    if (token) {
      props.settoken(token.attributes.token);
      props.opennotification("Login successful.");
    } else {
      props.opennotification("Email and/or password not recognized.");
    }
  }

  async function registerUser(values) {
    const firstName = values.firstname;
    const lastName = values.lastname;
    const email = values.email;
    const password = values.password;
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
    if (errors) {
      console.log("Error in user signup: ", errors);
    }
    return [data, email, password];
  }

  async function createUserToken(email, password) {
    console.log(`${email}:${password}`)
    const credentials = new Buffer(`${email}:${password}`).toString("base64"); // Generate user token
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
    console.log("Create token errors: ", errors)
    console.log("Create token data: ", data)
    return data.attributes.token;
  }

  async function createLicense(userdata, usertoken) {
    const response = await fetch(
      // Create license
      `https://api.keygen.sh/v1/accounts/${UUID}/licenses`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/vnd.api+json",
          Accept: "application/vnd.api+json",
          Authorization: `Bearer ${usertoken}`,
        },
        body: JSON.stringify({
          data: {
            type: "licenses",
            relationships: {
              policy: {
                data: { type: "policies", id: policyid },
              },
              user: {
                data: { type: userdata.type, id: userdata.id },
              },
            },
          },
        }),
      }
    );

    const { data, errors } = await response.json();
  }

  const onFinishLogin = (values) => {
    validateUser(values);
  };

  async function onFinishRegister (values) {
    const [userdata, email, password] = await registerUser(values);
    const usertoken = await createUserToken(email, password);
    createLicense(userdata, usertoken);
  };

  if (loginState === "login") {
    return (
      <Card className="card-login" title="CryoBase">
        <Form
          id="login"
          form={form}
          name="normal_login"
          className="login-form"
          onFinish={onFinishLogin}
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email address.",
              },
            ]}
          >
            <Input
              type="email"
              name="email"
              id="email"
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Email Address"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password.",
              },
            ]}
          >
            <Input
              type="password"
              name="password"
              id="password"
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              Log in
            </Button>
          </Form.Item>

          <a href="#" onClick={() => {
            setLoginState("register")
            form.setFieldsValue({
              ["email"]: null,
              ["password"]: null,
            })}
          }>
            Register
          </a>
        </Form>
      </Card>
    );
  } else if (loginState === "register") {
    return (
      <Card className="card-register" title="CryoBase">
        <Form id="register" onFinish={onFinishRegister}>
          <Form.Item
            name="firstname"
            rules={[
              {
                required: true,
                message: "Please input your first name.",
              },
            ]}
          >
            <Input
              type="text"
              name="firstname"
              id="firstname"
              placeholder="First Name"
            />
          </Form.Item>

          <Form.Item
            name="lastname"
            rules={[
              {
                required: true,
                message: "Please input your last name.",
              },
            ]}
          >
            <Input
              type="text"
              name="lastname"
              id="lastname"
              placeholder="Last Name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email address.",
              },
            ]}
          >
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="Email Address"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input a password.",
              },
            ]}
          >
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              Register
            </Button>
          </Form.Item>
          <a href="#" onClick={() => {
            setLoginState("login")
            form.setFieldsValue({
              ["firstname"]: null,
              ["lastname"]: null,
              ["email"]: null,
              ["password"]: null,
            })}
          }>
            Back to login screen
          </a>
        </Form>
      </Card>
    );
  }
}

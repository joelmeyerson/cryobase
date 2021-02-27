import React from "react";
import { Form, Input, Button, Card, Row, Col } from "antd";
import { Link, useHistory } from "react-router-dom";
import { registerUser, createUserToken, createLicense } from "./keygen.js";

export default function Register(props) {
  const [form] = Form.useForm();

  const history = useHistory();

  async function onFinish(values) {
    const firstName = values.firstname;
    const lastName = values.lastname;
    const email = values.email;
    const password = values.password;

    const [dataRegister, errorsRegister] = await registerUser(
      firstName,
      lastName,
      email,
      password
    );
    if (errorsRegister) {
      if (errorsRegister[0].code === "EMAIL_TAKEN") {
        props.opennotification(
          "Error with registration. This email address is already registered."
        );
      } else {
        props.opennotification("There was an error during registration.");
      }
    } else if (dataRegister) {
      const [dataToken, errorsToken] = await createUserToken(email, password);
      if (dataToken) {
        const [dataLicense, errorsLicense] = await createLicense(
          dataRegister.type,
          dataRegister.id,
          dataToken.attributes.token
        );
        if (dataLicense) {
          history.push("/login");
          props.opennotification(
            "Registration successful. You can now log in."
          );
        }
      } else {
        props.opennotification(
          "There was a server error with user token generation"
        );
      }
    } else {
      props.opennotification("Registration could not be completed.");
    }
  }

  return (
    <Card className="card-register" title="CryoBase">
      <Form name="register" form={form} onFinish={onFinish}>
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

        <Row align="bottom">
          <Col span={12}>
            <Link to="/login">Back to login screen</Link>
          </Col>
          <Col span={12}>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="button-auth">
                Register
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Popover, Row, Col } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  validateUser,
  fetchLicense,
  validateLicense,
  registerUser,
  createUserToken,
  createLicense,
} from "./Authentication.js";

export default function Login(props) {
  const [form] = Form.useForm();

  // When component loads reset the user token state variable. Safeguard for when user logs out and the same or another user logs in.
  useEffect(() => {
    props.setauthuserdata({})
  }, []);

  // If user succesfully authenticates, check if there is existing AWS config. Prevents new user from accessing previous user's AWS config
  async function checkPreviousUser(authuser) {
    if (localStorage.hasOwnProperty("user") === true) {
      var previoususer = JSON.parse(localStorage.getItem("user"));
      if (authuser !== previoususer) {
        await props.setconfigaws({ // Clear AWS config from state
          bucket: "",
          accessKey: "",
          secretKey: "",
        });
        localStorage.removeItem('configaws') // Clear AWS config from local storage
        props.setconfigvalid(false) // Set AWS config to invalid
        localStorage.setItem("user", JSON.stringify(authuser)); // Store the new user name
      }
    } else {
      localStorage.setItem("user", JSON.stringify(authuser)); // Create a "user" in local storage since none exists
    }
  }

  async function onFinish(values) {
    const [dataUser, errorsUser] = await validateUser(
      values.email,
      values.password
    );
    if (dataUser) {
      const [dataLicense, errorsLicense] = await fetchLicense(
        dataUser.attributes.token
      );
      if (dataLicense.length === 1) {
        // If true then a license was found
        const [
          metaValidate,
          dataValidate,
          errorsValidate,
        ] = await validateLicense(dataUser.attributes.token, dataLicense[0].id);

        if (metaValidate.constant === "VALID") {
          // License is valid
          await checkPreviousUser(values.email); // If new user does not match previous user, clear AWS config
          props.setauthuser(values.email); // Store user email for use inside app
          props.setauthuserdata(dataUser); // Store token for checking license inside app
          props.setauth(true); // User is now authenticated
          props.opennotification("Login successful.");
        } else {
          props.opennotification("There was an error validating the license.");
        }
      } else if (dataLicense.length === 0) {
        // If true then no license was found
        props.opennotification("No license was found.");
      } else {
        props.opennotification(
          "There was an error while retrieving the license."
        );
      }
    } else if (errorsUser) {
      props.opennotification("Email and/or password not recognized.");
    } else {
      props.opennotification("There was an error in the login process.");
    }
  }

  return (
    <Card className="card-login" title="CryoBase">
      <Form name="login" form={form} onFinish={onFinish}>
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
            placeholder="Email address"
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

        <Row align="bottom">
          <Col span={12}>
            <Link to="/register">Register</Link>
            <br></br>
            <Popover
              placement="right"
              content={"None"}
              trigger="click"
            >
              <a href="#">Reset password</a>
            </Popover>
          </Col>
          <Col span={12}>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="button-auth">
                Log in
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

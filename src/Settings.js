import React, { useState, useEffect } from "react";
import { Button, Row, Col, Modal, Input, Tag, Divider, Form } from "antd";
import "./App.css";

export default function Settings(props) {
  const [validating, setValidating] = useState(false); // Used to toggle loading on Settings modal
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [props.modalvisible]);

  // Handle form completion
  async function onFinish(formvals) {
    await setValidating(true);
    const creds = {
      "bucket": formvals.bucket,
      "accessKey": formvals.accesskey,
      "secretKey": formvals.secretkey,
    };
    await props.configureaws(creds);
    form.resetFields();
    await setValidating(false);
  }

  return (
    <Modal
      title="Settings"
      visible={props.modalvisible}
      closable={false}
      footer={[
        <Button
          key="close"
          onClick={props.handleclose}
          type="primary"
          disabled={validating}
        >
          Close
        </Button>,
      ]}
    >
      <Row>
        <Col>
          <span>
            <Tag>Version: 1.0.2</Tag>
          </span>
          <br></br>
          <span>
            <Tag>User: {props.authuser}</Tag>
          </span>
          <br></br>
          {props.auth === true ? (
            <span>
              <Tag color="green">License: VALID</Tag>
            </span>
          ) : (
            <span>
              <Tag color="red">License: INVALID</Tag>
            </span>
          )}
        </Col>
      </Row>

      <Divider></Divider>

      {props.configaws.bucket === "" ? (
        <p>Enter AWS S3 configuration.</p>
      ) : (
        <p>
          Bucket: <Tag color="blue">{props.configaws.bucket}</Tag>
          <br></br>
          AWS Access Key: <Tag color="blue">{props.configaws.accessKey}</Tag>
          <br></br>
          AWS Secret Key: <Tag color="blue">HIDDEN</Tag>
        </p>
      )}

      <Form
        id="settings"
        form={form}
        size="small"
        name="settings"
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 20 }}
        layout="horizontal"
        requiredMark={false}
        onFinish={onFinish}
      >
        <Form.Item
          name="bucket"
          valuePropName="value"
          rules={[{ required: "true", message: "Enter a bucket name." }]}
        >
          <Input
            placeholder={"AWS S3 bucket name"}
            disabled={
              props.downloadstate === true || props.uploadstate === true
            }
          />
        </Form.Item>

        <Form.Item
          name="accesskey"
          valuePropName="value"
          rules={[{ required: "true", message: "Enter an AWS Access Key." }]}
        >
          <Input
            placeholder={"AWS Access Key"}
            disabled={
              props.downloadstate === true || props.uploadstate === true
            }
          />
        </Form.Item>

        <Form.Item
          name="secretkey"
          valuePropName="value"
          rules={[{ required: "true", message: "Enter an AWS Secret Key." }]}
        >
          <Input
            placeholder={"AWS Secret Key"}
            disabled={
              props.downloadstate === true || props.uploadstate === true
            }
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            loading={validating}
            block
            disabled={
              props.downloadstate === true || props.uploadstate === true
            }
            htmlType="submit"
          >
            Update AWS Credentials
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

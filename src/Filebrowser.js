import React, { useState } from "react";
import { Modal, Button, Form, Input } from "antd";
import { FolderAddOutlined } from "@ant-design/icons";

import fs from "fs";
import path from "path";
import glob from "glob";

const files = path.resolve(path.join(process.cwd(), "../test/data/**/*.*"));

export default function FileBrowser(props) {
  const [modalVisible, setModalVisible] = useState(false);
  const imgs = glob
    .sync(files)
    .map((filename) => <img src={`file://${filename}`} height="100"></img>);

  return (
    <>
      <div>{imgs}</div>
      <span onClick={() => setModalVisible(true)}>
        <FolderAddOutlined />
      </span>

      <Modal
        title="Path Selection"
        style={{ top: 20 }}
        visible={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
      ></Modal>
    </>
  );
}

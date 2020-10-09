import React, { useState } from 'react';
import { Modal, Button, Form, Input, } from 'antd';
import { FolderAddOutlined, } from '@ant-design/icons';

export default function FileBrowser(props) {

  const [modalVisible, setModalVisible] = useState(false);

  return (
        <>
          <span onClick={() => setModalVisible(true)}>
            <FolderAddOutlined />
          </span>

          <Modal
            title="Path Selection"
            style={{ top: 20 }}
            visible={modalVisible}
            onOk={() => setModalVisible(false)}
            onCancel={() => setModalVisible(false)}
          >
          </Modal>
        </>


  );
}

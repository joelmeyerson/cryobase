import React, { useEffect } from "react";
import {
  Form,
  Card,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Popover,
  Switch,
  Table,
  Progress,
  Row,
  Col,
  Tag,
} from "antd";
import {
  FolderOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  StopOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import moment from "moment";

export default function Upload(props) {
  const [form] = Form.useForm(); // Create ANTD form

  // Table set up
  const tableColumns = [
    {
      title: "Local Data Files",
      dataIndex: "name",
    },
  ];
  const scroll = {};
  scroll.y = 300;

  // Custom table loading indicator
  const customLoading = {
    spinning: props.uploadtableloading, // tableLoading is state with boolean
    indicator: (
      <div style={{ fontSize: "20px" }}>
        <LoadingOutlined />
      </div>
    ),
  };

  // Clear form when transfer ends
  useEffect(() => {
    if (props.uploadstate === false) {
      props.setuploadcount(0);
      form.resetFields();
      props.setfilelist([]);
      props.setuploadpathname({
        "path": "",
      });
    }
  }, [props.uploadstate]);


  // When component loads populuate form with current metadata
  useEffect(() => {
    if (props.uploadcount !== 0) {
      form.setFieldsValue({
        "apix": props.metadata.apix,
        "camera": props.metadata.camera,
        "cs": props.metadata.cs,
        "dataset": props.metadata.dataset,
        "date": moment(props.metadata.date, "YYYY-MM-DD"),
        "description": props.metadata.description,
        "dose": props.metadata.dose,
        "exposuretime": props.metadata.exposuretime,
        "filter": props.metadata.filter,
        "frames": props.metadata.frames,
        "mag": props.metadata.mag,
        "microscope": props.metadata.microscope,
        // "path" handled in a different useEffect
        "storage": props.metadata.storage,
        "voltage": props.metadata.voltage,
      });
    }
  }, []);

  // Update form fields when pathName state updates
  useEffect(() => {
    form.setFieldsValue(props.uploadpathname);
    populateTable();
  }, [props.uploadpathname]);

  // Handle data path input, mediated by preload.js
  async function choosePath() {
    var dataPath = await window.electron.selectdirectory();
    if (dataPath.length === 0) {
    } else {
      var key = "path";
      var value = dataPath[0];
      props.setuploadpathname({
        [key]: value,
      });
    }
  }

  // Display file counts after selecting path
  function countFiles(ext) {
    if (
      props.filelist === undefined ||
      props.filelist.length === 0 ||
      props.filelist[0].key === ""
    ) {
      return "";
    } else if (ext === "total") {
      return props.filelist.length;
    } else {
      var files = [];
      for (var i = 0; i < props.filelist.length; i++) {
        files.push(props.filelist[i].name);
      }
      const countlower = files.filter((file) =>
        file.endsWith(ext.toLowerCase())
      ).length;
      const countupper = files.filter((file) =>
        file.endsWith(ext.toUpperCase())
      ).length;
      return countlower + countupper;
    }
  }

  // Populate file listing after selecting path
  async function populateTable() {
    if (props.uploadpathname.path !== "") {
      await props.setuploadtableloading(true);
      const files = await window.electron.listdirectory(
        props.uploadpathname.path
      );
      const filesObjArray = [];
      files.forEach((file, index) => {
        var entry = {};
        entry.key = index;
        entry.name = file;
        filesObjArray.push(entry);
      });
      props.setfilelist(filesObjArray);
    }
    await props.setuploadtableloading(false);
  }

  // Handle form completion
  async function onFinish(formvals) {
    const date = new Date().getDate(); //Current date
    const month = new Date().getMonth() + 1; //Current month
    const year = new Date().getFullYear(); //Current year
    const hours = new Date().getHours(); //Current hours
    const min = new Date().getMinutes(); //Current minutes
    const sec = new Date().getSeconds(); //Current seconds
    const time =
      year + "-" + month + "-" + date + "-" + hours + "-" + min + "-" + sec;

    // Update metadata state with form values
    props.setmetadata({
      apix: formvals.apix,
      camera: formvals.camera,
      cs: formvals.cs,
      dataid: formvals.dataset.concat("-" + time), // Create session ID from timestamp and dataset name
      dataset: formvals.dataset,
      date: formvals.date.format("YYYY-MM-DD"),
      description: formvals.description,
      dose: formvals.dose,
      exposuretime: formvals.exposuretime,
      filecount: props.filelist.length,
      filter: formvals.filter,
      frames: formvals.frames,
      mag: formvals.mag,
      microscope: formvals.microscope,
      path: formvals.path,
      status: formvals.storage === "STANDARD" ? "standard" : "archived",
      storage: formvals.storage,
      timestamp: time,
      uploadcompleted: false,
      voltage: formvals.voltage,
    });
    props.setuploadstate(true);
    props.setuitoggle(true);
  }

  async function stopUpload() {
    await props.setuploadstate(false);
  }

  return (
    <Card className="archive-card" size="small" id="session" title="Upload Data" bordered={true}>
      <Row justify="space-around" align="top">
        <Col span={10}>
          <Form
            id="sessionbuilder"
            form={form}
            name="metadata"
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 20 }}
            layout="horizontal"
            size="small"
            requiredMark={false}
            initialValues={{
              path: props.uploadpathname.path,
              description: "",
              filter: false,
            }}
            onFinish={onFinish}
          >
            <Form.Item
              label="Local Data Path"
              name="path"
              valuePropName="value"
              rules={[{ required: "true", message: "Required field." }]}
            >
              <Input
                disabled={props.uitoggle}
                value={props.uploadpathname.path}
                onKeyDown={(e) => e.preventDefault()}
                addonAfter={
                  <span onClick={props.lockui === true || props.uitoggle === true ? null : choosePath}>
                    <FolderOutlined />
                  </span>
                }
              />
            </Form.Item>

            <Form.Item
              label="Dataset Name"
              name="dataset"
              valuePropName="value"
              rules={[
                { required: "true", message: "Required field."},
                {
                  pattern: /^[a-zA-Z0-9-]+$/,
                  message: "Letters, numbers, and dashes only.",
                },
                { max: 30, message: "Maximum 30 characters." },
              ]}
            >
              <Input disabled={props.uitoggle} />
            </Form.Item>

            <Form.Item
              label="Acquisition Date"
              name="date"
              valuePropName="value"
              rules={[
                { required: "true", message: "Required field." },
                { type: "date", message: "Must be a date." },
              ]}
            >
              <DatePicker
                disabled={props.uitoggle}
                allowClear={false}
                onKeyDown={(e) => e.preventDefault()}
              />
            </Form.Item>

            <Form.Item
              label="Sample Information"
              name="description"
              valuePropName="value"
              rules={[
                {
                  pattern: /^[a-zA-Z0-9\s,.]+$/,
                  message:
                    "Letters, numbers, spaces, commas, and periods only.",
                },
                { max: 200, message: "Maximum 200 characters." },
              ]}
            >
              <Input.TextArea
                disabled={props.uitoggle}
                placeholder="Optional sample details."
                autoSize={{ minRows: 4, maxRows: 4 }}
                allowClear={false}
              />
            </Form.Item>

            <Form.Item
              label="Camera"
              name="camera"
              valuePropName="value"
              rules={[{ required: "true", message: "Required field." }]}
            >
              <Select disabled={props.uitoggle}>
                <Select.Option value="K3">K3</Select.Option>
                <Select.Option value="K2">K2</Select.Option>
                <Select.Option value="Falcon 4">Falcon 4</Select.Option>
                <Select.Option value="Falcon 3">Falcon 3</Select.Option>
                <Select.Option value="Falcon 2">Falcon 2</Select.Option>
                <Select.Option value="Falcon 1">Falcon 1</Select.Option>
                <Select.Option value="Rio">Rio</Select.Option>
                <Select.Option value="OneView">OneView</Select.Option>
                <Select.Option value="DE-20">DE-20</Select.Option>
                <Select.Option value="DE-16">DE-16</Select.Option>
                <Select.Option value="DE-12">DE-12</Select.Option>
                <Select.Option value="DE-10">DE-10</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Microscope"
              name="microscope"
              valuePropName="value"
              rules={[{ required: "true", message: "Required field." }]}
            >
              <Select disabled={props.uitoggle}>
                <Select.Option value="Krios">Krios</Select.Option>
                <Select.Option value="Arctica">Arctica</Select.Option>
                <Select.Option value="Glacios">Glacios</Select.Option>
                <Select.Option value="Tundra">Tundra</Select.Option>
                <Select.Option value="F30">F30</Select.Option>
                <Select.Option value="F20">F20</Select.Option>
                <Select.Option value="Polara">Polara</Select.Option>
                <Select.Option value="CryoARM">CryoARM</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Voltage (kV)"
              name="voltage"
              valuePropName="value"
              rules={[{ required: "true", message: "Required field." }]}
            >
              <Select disabled={props.uitoggle}>
                <Select.Option value="300">300</Select.Option>
                <Select.Option value="200">200</Select.Option>
                <Select.Option value="120">120</Select.Option>
                <Select.Option value="100">120</Select.Option>
                <Select.Option value="80">80</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Magnification (X)"
              name="mag"
              valuePropName="value"
              rules={[
                { required: "true", message: "Required field." },
                { type: "integer", message: "Must be an integer number." },
              ]}
            >
              <InputNumber
                disabled={props.uitoggle}
                min={1000}
                max={1000000}
                step={1000}
              />
            </Form.Item>

            <Form.Item
              label="Cs (mm)"
              name="cs"
              valuePropName="value"
              rules={[
                { required: "true", message: "Required field." },
                { type: "number", message: "Must be a number." },
              ]}
            >
              <InputNumber
                disabled={props.uitoggle}
                min={0.1}
                max={100}
                step={0.1}
              />
            </Form.Item>

            <Form.Item
              label="Energy Filter"
              name="filter"
              valuePropName="checked"
            >
              <Switch disabled={props.uitoggle} />
            </Form.Item>

            <Form.Item
              label="Pixel Size (Å)"
              name="apix"
              valuePropName="value"
              rules={[
                { required: "true", message: "Required field." },
                { type: "number", message: "Must be a number." },
              ]}
            >
              <InputNumber
                disabled={props.uitoggle}
                min={0.1}
                max={100}
                step={0.01}
              />
            </Form.Item>

            <Form.Item
              label="Frames per Movie"
              name="frames"
              valuePropName="value"
              rules={[
                { required: "true", message: "Required field." },
                { type: "integer", message: "Must be an integer number." },
              ]}
            >
              <InputNumber
                disabled={props.uitoggle}
                min={1}
                max={1000}
                step={1}
              />
            </Form.Item>

            <Form.Item
              label="Exposure Time (sec)"
              name="exposuretime"
              valuePropName="value"
              rules={[
                { required: "true", message: "Required field." },
                { type: "number", message: "Must be a number." },
              ]}
            >
              <InputNumber
                disabled={props.uitoggle}
                min={0.1}
                max={1000}
                step={0.1}
              />
            </Form.Item>

            <Form.Item
              label="Total Dose (e/A^2)"
              name="dose"
              valuePropName="value"
              rules={[
                { required: "true", message: "Required field." },
                { type: "number", message: "Must be a number." },
              ]}
            >
              <InputNumber
                disabled={props.uitoggle}
                min={1}
                max={1000}
                step={0.01}
              />
            </Form.Item>

            <Form.Item
              label={
                <Popover
                  placement="topLeft"
                  content={
                    <>
                      <div>
                        DEEP_ARCHIVE is low cost but requires a 12-48 hour
                        retrieval step before data can be downloaded.
                      </div>
                      <div>
                        STANDARD is higher cost but can be downloaded on-demand.
                      </div>
                    </>
                  }
                >
                  <InfoCircleOutlined /> {"Storage Class"}
                </Popover>
              }
              name="storage"
              valuePropName="value"
              rules={[{ required: "true", message: "Required field." }]}
            >
              <Select disabled={props.uitoggle}>
                <Select.Option value="DEEP_ARCHIVE">
                  AWS S3 DEEP_ARCHIVE
                </Select.Option>
                <Select.Option value="STANDARD">AWS S3 STANDARD</Select.Option>
              </Select>
            </Form.Item>

            <br></br>
            <Row justify="center" align="top" gutter={[16, 16]}>
              <Col>
                <Form.Item>
                  <Button
                    icon={<CaretRightOutlined />}
                    disabled={props.lockui === true || props.uitoggle === true}
                    type="primary"
                    size="middle"
                    htmlType="submit"
                  >
                    Start Upload
                  </Button>
                </Form.Item>
                </Col>
                <Col>
                <Form.Item>
                  <Button
                    disabled={!props.uitoggle}
                    type="danger"
                    size="middle"
                    icon={<StopOutlined />}
                    onClick={() => stopUpload()}
                  >
                    Stop Upload
                  </Button>
                </Form.Item>
                </Col>
                <Col>
                <Form.Item>
                  <Button
                    disabled={props.uitoggle}
                    size="middle"
                    onClick={() => {
                      form.resetFields();
                      props.setuploadcount(0); // Reset transfer count
                      props.setfilelist([]);
                      props.setuploadpathname({
                        "path": "",
                      });
                    }}
                  >
                    Clear Form
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
        <Col span={12}>
          <Table
            id="sessioninfo"
            columns={tableColumns}
            dataSource={props.filelist}
            bordered={true}
            size="small"
            footer={() => ""}
            scroll={scroll}
            loading={customLoading}
            pagination={false}
          />
          <br></br>
          {props.filelist.length > 0 ? (
            <div>
              <Tag color="magenta">
                TIF/TIFF: {countFiles("tif") + countFiles("tiff")}{" "}
              </Tag>
              <Tag color="green">
                MRC/MRCS: {countFiles("mrc") + countFiles("mrcs")}{" "}
              </Tag>
              <Tag color="cyan">DM4: {countFiles("dm4")} </Tag>
              <Tag color="gold">
                Other:{" "}
                {countFiles("total") -
                  countFiles("tif") -
                  countFiles("tiff") -
                  countFiles("mrc") -
                  countFiles("mrcs") -
                  countFiles("dm4")}{" "}
              </Tag>
              <Tag color="blue">Total: {countFiles("total")} </Tag>
            </div>
          ) : (
            ""
          )}
          <br></br>
          {props.uploadstate === true ? (
            <div>
              <Progress
                type="line"
                strokeColor={"geekblue-4"}
                status="active"
                percent={
                  props.uploadstate === false
                    ? 0
                    : Math.round(
                        100 * (props.uploadcount / props.filelist.length)
                      )
                }
              />

              {props.uploadstate === false
                ? "No active file transfer."
                : "Files transferred: " +
                  props.uploadcount +
                  " / " +
                  props.filelist.length}
              <br></br>
              {props.uploadstate === true &&
              props.uploadcount < props.filelist.length ? (
                <div>
                  {" "}
                  <LoadingOutlined /> {" "}
                  {props.filelist[props.uploadcount].name}{" "}
                </div>
              ) : (
                ""
              )}
            </div>
          ) : (
            ""
          )}
        </Col>
      </Row>
    </Card>
  );
}

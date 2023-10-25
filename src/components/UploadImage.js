import React, {useState, useCallback} from 'react';
import {LoadingOutlined, PlusOutlined} from '@ant-design/icons';
import {message, Upload} from 'antd';

const UploadImage = ({id, img, setImg}) => {
  const [loading, setLoading] = useState(false);

  const beforeUpload = useCallback((file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    return isJpgOrPng;
  }, []);

  const getBase64 = useCallback(
    (file) => {
      setLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setLoading(false);
        setImg(reader.result);
      };
      reader.onerror = () => {
        setLoading(false);
        message.error({
          message: 'Failed to load image',
          description: reader.error.message
        });
      };
    },
    [setImg]
  );

  return (
    <>
      <Upload
        name="avatar"
        listType="picture-card"
        showUploadList={false}
        action={(file) => new Promise(() => getBase64(file))}
        beforeUpload={beforeUpload}
      >
        {img ? (
          <img
            id={id}
            src={img}
            alt="avatar"
            style={{
              width: '100%'
            }}
          />
        ) : (
          <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div
              style={{
                marginTop: 8
              }}
            >
              Upload
            </div>
          </div>
        )}
      </Upload>
    </>
  );
};
export default UploadImage;

import {Image} from 'antd';

const PreviewImage = ({preview, setPreview}) => (
  <Image
    width={200}
    style={{display: 'none'}}
    preview={{
      visible: !!preview,
      src: preview,
      onVisibleChange: setPreview
    }}
  />
);

export default PreviewImage;

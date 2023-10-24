import {useCallback, useState} from 'react';
import styled from 'styled-components';
import {Button, Slider, InputNumber, Skeleton, Spin, message} from 'antd';
import {EyeOutlined} from '@ant-design/icons';
import UploadImage from './components/UploadImage';
import PreviewImage from './components/PreviewImage';

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
`;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  margin: 15px;
  min-width: 300px;
  min-height: 300px;
  justify-content: space-between;
  align-items: center;
  border: 0.5px solid lightgray;
  border-radius: 5px;
  .ant-upload-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Title = styled.h2``;

const Preview = styled(Button).attrs({
  size: 'small',
  icon: <EyeOutlined />
})`
  width: 100%;
  margin-top: 5px;
`;

const getImageData = (img, cb) => {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    cb(context.getImageData(0, 0, canvas.width, canvas.height));
  };
  image.src = img;
};

const App = () => {
  const [inputValue, setInputValue] = useState(0);
  const [originalPhoto, setOriginalPhoto] = useState();
  const [editedPhoto, setEditedPhoto] = useState();
  const [finalPhoto, setFinalPhoto] = useState();
  const [preview, setPreview] = useState();
  const [loading, setLoading] = useState(false);

  const onMerge = useCallback(() => {
    getImageData(originalPhoto, (data) => {
      const originalData = data;
      getImageData(editedPhoto, (data) => {
        const editedData = data;
        if (originalData.width === editedData.width && originalData.height === editedData.height) {
          setLoading(true);
          setTimeout(() => {
            const width = originalData.width;
            const height = originalData.height;
            const buffer = new Uint8ClampedArray(width * height * 4);
            const diffPercent = inputValue / 100;

            for (let x = 0; x < width; x++) {
              for (let y = 0; y < height; y++) {
                const index = (y * width + x) * 4;
                const redDiff = editedData.data[index] - originalData.data[index];
                const greenDiff = editedData.data[index + 1] - originalData.data[index + 1];
                const blueDiff = editedData.data[index + 2] - originalData.data[index + 2];
                const alphaDiff = editedData.data[index + 3] - originalData.data[index + 3];

                buffer[index] = originalData.data[index] + redDiff * diffPercent;
                buffer[index + 1] = originalData.data[index + 1] + greenDiff * diffPercent;
                buffer[index + 2] = originalData.data[index + 2] + blueDiff * diffPercent;
                buffer[index + 3] = originalData.data[index + 3] + alphaDiff * diffPercent;
              }
            }

            const finalCanvas = document.createElement('canvas');
            const ctx = finalCanvas.getContext('2d');
            finalCanvas.width = width;
            finalCanvas.height = height;

            const idata = ctx.createImageData(width, height);
            idata.data.set(buffer);

            ctx.putImageData(idata, 0, 0);

            setLoading(false);
            setFinalPhoto(finalCanvas.toDataURL());
          }, 200);
        } else {
          message.error('Images dimensions should be the same!');
        }
      });
    });
  }, [originalPhoto, editedPhoto, inputValue]);

  return (
    <Container>
      <Row>
        <Box>
          <Title>Original Photo</Title>
          <UploadImage img={originalPhoto} setImg={setOriginalPhoto} />
          <Preview onClick={() => setPreview([originalPhoto, editedPhoto, finalPhoto][0])}>Preview</Preview>
        </Box>
        <Box>
          <Title>Edited Photo</Title>
          <UploadImage img={editedPhoto} setImg={setEditedPhoto} />
          <Preview onClick={() => setPreview([originalPhoto, editedPhoto, finalPhoto][1])}>Preview</Preview>
        </Box>
      </Row>
      <Row>
        <Slider style={{width: 200, margin: '0 16px'}} min={0} max={100} value={inputValue} onChange={setInputValue} />
        <InputNumber min={0} max={100} value={inputValue} onChange={setInputValue} />
      </Row>
      <Button type="primary" onClick={onMerge}>
        MERGE
      </Button>
      <Box>
        <Title>Final Photo</Title>
        {loading ? (
          <Spin size="large" />
        ) : finalPhoto ? (
          <img alt="final" src={finalPhoto} style={{maxWidth: 100}} />
        ) : (
          <Skeleton.Image active />
        )}
        <Preview onClick={() => setPreview([originalPhoto, editedPhoto, finalPhoto][2])}>Preview</Preview>
      </Box>
      <PreviewImage {...{preview, setPreview}} />
    </Container>
  );
};

export default App;

import {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {debounce} from 'lodash';
import {Button, Slider, Skeleton, Spin, message} from 'antd';
import {EyeOutlined, ArrowRightOutlined, ArrowLeftOutlined} from '@ant-design/icons';
import UploadImage from './components/UploadImage';
import PreviewImage from './components/PreviewImage';

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  overflow: hidden;
`;

const ImagesWrapper = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;
`;

const SliderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #333a;
  color: white;
  width: 100%;
  padding: 15px;
  margin-top: 15px;
`;

const Box = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 15px;
  min-height: 300px;
  justify-content: space-between;
  align-items: center;
  border: 0.5px solid lightgray;
  border-radius: 5px;
  overflow: auto;
  .ant-upload-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    .ant-upload {
      min-width: 100px;
      min-height: 100px;
      width: 100% !important;
      height: 100% !important;
      margin-bottom: 0 !important;
      margin-inline-end: 0 !important;
    }
  }
`;

const FinalImage = styled.img`
  min-width: 100px;
  min-height: 100px;
  width: 100%;
  height: 100%;
`;

const ImageWrapper = styled.div`
  padding: 8px;
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
          }, 100);
        } else {
          message.error('Images dimensions should be the same!');
        }
      });
    });
  }, [originalPhoto, editedPhoto, inputValue]);

  useEffect(() => {
    onMerge();
  }, [inputValue, onMerge]);

  return (
    <Container>
      <ImagesWrapper>
        <Box>
          <Title>Original Photo</Title>
          <ImageWrapper>
            <UploadImage img={originalPhoto} setImg={setOriginalPhoto} />
          </ImageWrapper>
          <Preview onClick={() => setPreview([originalPhoto, editedPhoto, finalPhoto][0])}>Preview</Preview>
        </Box>
        <ArrowRightOutlined />
        <Box>
          <Title>Final Photo</Title>
          <ImageWrapper>
            {loading ? (
              <Spin size="large" />
            ) : finalPhoto ? (
              <FinalImage alt="final" src={finalPhoto} />
            ) : (
              <Skeleton.Image active />
            )}
          </ImageWrapper>
          <Preview onClick={() => setPreview([originalPhoto, editedPhoto, finalPhoto][2])}>Preview</Preview>
        </Box>
        <ArrowLeftOutlined />
        <Box>
          <Title>Edited Photo</Title>
          <ImageWrapper>
            <UploadImage img={editedPhoto} setImg={setEditedPhoto} />
          </ImageWrapper>
          <Preview onClick={() => setPreview([originalPhoto, editedPhoto, finalPhoto][1])}>Preview</Preview>
        </Box>
      </ImagesWrapper>
      <SliderWrapper>
        <Slider style={{width: 350, margin: '0 16px'}} min={0} max={100} onChange={debounce(setInputValue, 300)} />
        <b>{inputValue}</b>
      </SliderWrapper>
      <PreviewImage {...{preview, setPreview}} />
    </Container>
  );
};

export default App;

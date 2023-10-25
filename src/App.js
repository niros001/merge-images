import {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {Button, Slider, Skeleton, message} from 'antd';
import {EyeOutlined, ArrowRightOutlined, ArrowLeftOutlined} from '@ant-design/icons';
import html2canvas from 'html2canvas';
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

const FinalImageContainer = styled.div`
  position: relative;
  min-width: 100px;
  min-height: 100px;
`;

const FinalImage = styled.img`
  position: absolute;
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

const App = () => {
  const [inputValue, setInputValue] = useState(0);
  const [originalPhoto, setOriginalPhoto] = useState();
  const [editedPhoto, setEditedPhoto] = useState();
  const [finalPhoto, setFinalPhoto] = useState();
  const [preview, setPreview] = useState();

  const createImage = useCallback(() => {
    const originalPhotoRef = document.getElementById('original-photo');
    const editedPhotoRef = document.getElementById('edited-photo');
    const finalImageContainerRef = document.getElementById('final-image-container');
    if (originalPhotoRef && editedPhotoRef && finalImageContainerRef) {
      if (
        originalPhotoRef?.offsetWidth !== editedPhotoRef?.offsetWidth ||
        originalPhotoRef?.offsetHeight !== editedPhotoRef?.offsetHeight
      ) {
        message.error('Images dimensions should be the same!');
        setFinalPhoto(null);
      } else {
        html2canvas(finalImageContainerRef).then((canvas) => {
          setFinalPhoto(canvas.toDataURL());
        });
      }
    }
  }, []);

  useEffect(() => {
    if (originalPhoto && editedPhoto) {
      const originalPhotoRef = document.getElementById('original-photo');
      const editedPhotoRef = document.getElementById('edited-photo');
      const finalImageContainerRef = document.getElementById('final-image-container');
      finalImageContainerRef.style.width = `${(originalPhotoRef || editedPhotoRef)?.offsetWidth}px`;
      finalImageContainerRef.style.height = `${(originalPhotoRef || editedPhotoRef)?.offsetHeight}px`;
    }
  }, [originalPhoto, editedPhoto]);

  return (
    <Container>
      <ImagesWrapper>
        <Box>
          <Title>Original Photo</Title>
          <ImageWrapper>
            <UploadImage id="original-photo" img={originalPhoto} setImg={setOriginalPhoto} />
          </ImageWrapper>
          <Preview onClick={() => setPreview(originalPhoto)}>Preview</Preview>
        </Box>
        <ArrowRightOutlined />
        <Box>
          <Title>Final Photo</Title>
          <ImageWrapper>
            {!originalPhoto || !editedPhoto ? (
              <Skeleton.Image active />
            ) : (
              <FinalImageContainer id="final-image-container">
                <FinalImage src={originalPhoto} />
                <FinalImage src={editedPhoto} style={{opacity: inputValue / 100}} />
              </FinalImageContainer>
            )}
          </ImageWrapper>
          <Preview onClick={() => setPreview(finalPhoto)}>Preview</Preview>
        </Box>
        <ArrowLeftOutlined />
        <Box>
          <Title>Edited Photo</Title>
          <ImageWrapper>
            <UploadImage id="edited-photo" img={editedPhoto} setImg={setEditedPhoto} />
          </ImageWrapper>
          <Preview onClick={() => setPreview(editedPhoto)}>Preview</Preview>
        </Box>
      </ImagesWrapper>
      <SliderWrapper>
        <Slider
          value={inputValue}
          style={{width: 350, margin: '0 16px'}}
          min={0}
          max={100}
          onChange={setInputValue}
          onAfterChange={createImage}
        />
        <b>{inputValue}</b>
      </SliderWrapper>
      <PreviewImage {...{preview, setPreview}} />
    </Container>
  );
};

export default App;

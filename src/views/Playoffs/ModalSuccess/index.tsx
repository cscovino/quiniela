import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import i18next from 'i18next';

import { ModalSuccessProps } from './types';

function ModalSuccess(props: ModalSuccessProps) {
  const { isOpen, onClose } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent fontFamily="qatar" fontSize="20px">
        <ModalHeader>{i18next.t<string>('PLAYOFFS:MODAL_SUCCESS_TITLE')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box textAlign="center">{i18next.t<string>('PLAYOFFS:MODAL_SUCCESS_TEXT')}</Box>
          <Box textAlign="center">{i18next.t<string>('PLAYOFFS:MODAL_SUCCESS_SUBTEXT')}</Box>
        </ModalBody>
        <ModalFooter>
          <Button
            alignSelf="center"
            fontSize="18px"
            color="#6f0625"
            bg="#fee1d2"
            _hover={{ bg: '#fa5d84' }}
            fontFamily="qatar"
            onClick={onClose}
          >
            {i18next.t<string>('PLAYOFFS:MODAL_SUCCESS_BUTTON')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ModalSuccess;

import {
  Button,
  HStack,
  Icon,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';
import { TbTrophy, TbMedal } from 'react-icons/tb';
import { useForm } from 'react-hook-form';
import i18next from 'i18next';

import { ModalFormProps } from './types';
import { FLAGS } from '@/helpers/flags';
import { Countries } from '@/types';

function ModalForm(props: ModalFormProps) {
  const { onSubmit, isOpen, onClose, finalPositions, buttonIsDisabled } = props;
  const { register, handleSubmit } = useForm<{ participant: string }>();

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent fontFamily="qatar" fontSize="20px">
          <ModalHeader>{i18next.t<string>('PLAYOFFS:MODAL_TITLE')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <Input {...register('participant', { required: true })} />
            <VStack marginTop="20px">
              <Text>{i18next.t<string>('PLAYOFFS:MODAL_SUBTITLE')}</Text>
              <HStack alignSelf="start">
                <Icon color="gold" as={TbTrophy} />
                <Image
                  src={FLAGS[finalPositions.first as Countries]}
                  alt={i18next.t<string>(`FLAGS:${finalPositions.first}`)}
                  height="20px"
                />
                <Text>{i18next.t<string>(`FLAGS:${finalPositions.first}`)}</Text>
              </HStack>
              <HStack alignSelf="start">
                <Icon color="silver" as={TbMedal} />
                <Image
                  src={FLAGS[finalPositions.second as Countries]}
                  alt={i18next.t<string>(`FLAGS:${finalPositions.second}`)}
                  height="20px"
                />
                <Text>{i18next.t<string>(`FLAGS:${finalPositions.second}`)}</Text>
              </HStack>
              <HStack alignSelf="start">
                <Icon color="#a46628" as={TbMedal} />
                <Image
                  src={FLAGS[finalPositions.third as Countries]}
                  alt={i18next.t<string>(`FLAGS:${finalPositions.third}`)}
                  height="20px"
                />
                <Text>{i18next.t<string>(`FLAGS:${finalPositions.third}`)}</Text>
              </HStack>
              <HStack alignSelf="start">
                <Image
                  src={FLAGS[finalPositions.fourth as Countries]}
                  alt={i18next.t<string>(`FLAGS:${finalPositions.fourth}`)}
                  height="20px"
                />
                <Text>{i18next.t<string>(`FLAGS:${finalPositions.fourth}`)}</Text>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              alignSelf="center"
              fontSize="18px"
              color="#6f0625"
              bg="#fee1d2"
              _hover={{ bg: '#fa5d84' }}
              fontFamily="qatar"
              type="submit"
              disabled={buttonIsDisabled}
            >
              {i18next.t<string>('PLAYOFFS:MODAL_SENT')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}

export default ModalForm;

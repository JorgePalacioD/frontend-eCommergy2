import React, { useState, useEffect } from 'react';
import { Box, Button, Input, VStack, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure, Heading, Img} from "@chakra-ui/react";
import Tarifas from './Tarifas';
import {PaginationTable} from "table-pagination-chakra-ui"
import logoEmpresa from '../assests/logoECommergy2-removebg-preview.png';
import logoInstitucional from '../assests/logo-sena-verde-complementario-png-2022.png';
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
const BuscarTarifas = () => {
  const navigate = useNavigate();
  const [tarifasRegistradas, setTarifasRegistradas] = useState([]);
  const [filteredTarifas, setFilteredTarifas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [operadores, setOperadores] = useState([]);
  const [sedes, setSedes] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTarifa, setSelectedTarifa] = useState(null);
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const handleHome = async () => {
    navigate('/home');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tarifasResponse, operadoresResponse, sedesResponse] = await Promise.all([
          fetch('http://localhost:3001/api/operadores_tarifas'),
          fetch('http://localhost:3001/api/operadores'),
          fetch('http://localhost:3001/api/sedes')
        ]);

        const tarifasData = await tarifasResponse.json();
        const operadoresData = await operadoresResponse.json();
        const sedesData = await sedesResponse.json();

        if (tarifasData.success && Array.isArray(tarifasData.data)) {
          setTarifasRegistradas(tarifasData.data);
          setFilteredTarifas(tarifasData.data);
        } else {
          console.error('Datos de tarifas no son un arreglo:', tarifasData);
        }

        if (Array.isArray(operadoresData)) {
          setOperadores(operadoresData);
        } else {
          console.error('Datos de operadores no son un arreglo:', operadoresData);
        }

        if (Array.isArray(sedesData)) {
          setSedes(sedesData);
        } else {
          console.error('Datos de sedes no son un arreglo:', sedesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = tarifasRegistradas.filter(tarifa =>
      getOperadorNombre(tarifa.idoperador).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSedeNombre(tarifa.idsede).toLowerCase().includes(searchTerm.toLowerCase()) ||
      tarifa.anio.toString().includes(searchTerm) ||
      (tarifa.mes && meses[tarifa.mes - 1].toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const sortedFiltered = filtered.sort((a, b) => a.mes - b.mes);

    setFilteredTarifas(sortedFiltered);
  }, [searchTerm, tarifasRegistradas]);

  const handleEdit = (tarifa) => {
    setSelectedTarifa(tarifa);
    onOpen();
  };

  const handleDelete = async (tarifa) => {
    const confirmDelete = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas eliminar esta Tarifa?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  
    if (confirmDelete.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:3001/api/operadores_tarifas/${tarifa.idtarifa}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          Swal.fire('Eliminado!', 'La tarifa ha sido eliminada.', 'success');
          setTarifasRegistradas(tarifasRegistradas.filter(t => t.idtarifa !== tarifa.idtarifa));
        } else {
          Swal.fire('Error', 'No se pudo eliminar la tarifa.', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Ocurrió un error al eliminar la tarifa: ' + error.message, 'error');
      }
    }
  };

  const getOperadorNombre = (idoperador) => {
    const operador = operadores.find(op => op.idoperador === idoperador);
    return operador ? operador.nombre : 'Desconocido';
  };

  const getSedeNombre = (idsede) => {
    const sede = sedes.find(sd => sd.idsede === idsede);
    return sede ? sede.nombre : 'Desconocido';
  };

  return (
    <Box fontFamily={''}>
      <VStack spacing={4} align='flex-start' w='full'>
        <Heading
          display='flex'
          justifyContent='space-between'
          padding={'0.5rem'}
          w={['full', 'mb']}
          backgroundColor='white'
          color={'#4a4745'}
        >
          <Img src={logoEmpresa} alt="Logo de la empresa" boxSize="50px" />
          <h2>eCommergy2</h2>
          <Img src={logoInstitucional} alt="Logo Institucional" boxSize="50px" />
        </Heading>
      </VStack>
      <Box p={5} backgroundColor="#3bb000" h="auto">
        <Box display="flex" justifyContent="space-between" mb={4}>
          <Input
            backgroundColor={'white'}
            borderColor='#525252'
            placeholder="Buscar por nombre del operador, sede, año o mes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button 
            marginLeft={'0.2rem'} 
            color={'white'} 
            backgroundColor='#007832' 
            _hover={{ backgroundColor: '#02652d' }} 
            _active={{ backgroundColor: '#003916' }} 
            onClick={() => { setSelectedTarifa(null); onOpen(); }}
          >
            Nuevo
          </Button>
          <Button 
            left={'0.1rem'}
            w='7rem' 
            color='white' 
            backgroundColor='#C8102E'
            _hover={{ backgroundColor: '#960000' }}
            _active={{ backgroundColor: '#6d0000' }}
            onClick={handleHome}
          >
            Regresar
          </Button>
        </Box>
        <TableContainer backgroundColor={''}>
          <Table variant='striped' colorScheme='teal'>
            <Thead>
              <Tr backgroundColor={'#52db07'}>
                <Th color={'white'}>Comercializador</Th>
                <Th color={'white'}>Sede</Th>
                <Th color={'white'}>Año</Th>
                <Th color={'white'}>Mes</Th>
                <Th color={'white'} isNumeric>
                  Valor <Text as="span" textTransform="lowercase">kWh</Text>
                </Th>
                <Th color={'white'}></Th>
              </Tr>
            </Thead>
            <Tbody backgroundColor={'white'}>
              {filteredTarifas.length > 0 ? (
                filteredTarifas.map((tarifa, index) => (
                  <Tr key={index}>
                    <Td>{getOperadorNombre(tarifa.idoperador)}</Td>
                    <Td>{getSedeNombre(tarifa.idsede)}</Td>
                    <Td>{tarifa.anio}</Td>
                    <Td>{meses[tarifa.mes - 1]}</Td>
                    <Td isNumeric>{tarifa.valorkh}</Td>
                    <Td>
                      <Button
                        size="sm"
                        color={'white'}
                        backgroundColor='#007832'
                        _hover={{ backgroundColor: '#02652d' }}
                        _active={{ backgroundColor: '#003916' }}
                        onClick={() => handleEdit(tarifa)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        color={'white'}
                        backgroundColor='#C8102E'
                        _hover={{ backgroundColor: '#960000' }}
                        _active={{ backgroundColor: '#6d0000' }}
                        onClick={() => handleDelete(tarifa)}
                        marginLeft={'0.8rem'}
                      >
                        Eliminar
                      </Button>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={6}>No se encontraron tarifas.</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedTarifa ? 'Editar Tarifa' : 'Nueva Tarifa'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            <Tarifas tarifa={selectedTarifa} onClose={onClose} />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default BuscarTarifas;
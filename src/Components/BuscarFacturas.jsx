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
import Facturas from './Facturas';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const BuscarFacturas = () => {
  const navigate = useNavigate();
  const [facturasRegistradas, setFacturasRegistradas] = useState([]);
  const [filteredFacturas, setFilteredFacturas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sedes, setSedes] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedFactura, setSelectedFactura] = useState(null);
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const handleHome = async () => {
    navigate('/home');
  }
  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/sedes');
        const result = await response.json();
        console.log('Datos de sedes:', result); // Muestra el resultado completo

        if (Array.isArray(result)) {
          setSedes(result);
        } else {
          console.error('Datos de sedes no son un arreglo:', result);
        }
      } catch (error) {
        console.error('Error fetching sedes:', error);
      }
    };

    fetchSedes();
  }, []);

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/facturas');
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const validData = result.data.map(item => ({
            numeroFactura: typeof item.numerofac === 'string' ? item.numerofac : '',
            fecha: typeof item.fecha === 'string' ? item.fecha : '',
            sede: typeof item.sede === 'number' ? item.sede : 0,
            anio: typeof item.anio === 'number' ? item.anio : 0,
            mes: typeof item.mes === 'number' ? item.mes : 0,
            cantidadKh: typeof item.cantidadkh === 'number' ? item.cantidadkh : 0,
            valorFactura: typeof item.valor_factura === 'number' ? item.valor_factura : 0,
            idfactura: item.idfactura // Asegúrate de que el idfactura esté presente
          }));
          setFacturasRegistradas(validData);
          setFilteredFacturas(validData);
        } else {
          console.error('Datos de facturas no son un arreglo o success es falso:', result);
        }
      } catch (error) {
        console.error('Error fetching facturas:', error);
      }
    };

    fetchFacturas();
  }, []);

  useEffect(() => {
    const filtered = facturasRegistradas.filter(factura => {
      const sedeNombre = sedes.find(sede => sede.idsede === factura.sede)?.nombre.toLowerCase() || '';
  
      return (
        (factura.numeroFactura && factura.numeroFactura.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sedeNombre && sedeNombre.includes(searchTerm.toLowerCase())) ||
        (factura.anio && factura.anio.toString().includes(searchTerm)) ||
        (factura.mes && factura.mes.toString().includes(searchTerm)) ||
        (factura.valorFactura && factura.valorFactura.toString().includes(searchTerm))
      );
    });
  
    // Ordenar las facturas filtradas por mes
    const sortedFiltered = filtered.sort((a, b) => a.mes - b.mes);
    
    setFilteredFacturas(sortedFiltered);
  }, [searchTerm, facturasRegistradas, sedes]);
  

  const handleEdit = (factura) => {
    setSelectedFactura(factura);
    onOpen();
  };

  const handleDelete = async (factura) => {
    // Preguntar confirmación de eliminación con Swal.fire
    const confirmDelete = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas eliminar esta factura?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  
    if (confirmDelete.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:3001/api/facturas/${factura.idfactura}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          // Mostrar mensaje de éxito
          Swal.fire('Eliminado!', 'La factura ha sido eliminada.', 'success');
          setFacturasRegistradas(facturasRegistradas.filter(f => f.idfactura !== factura.idfactura));
        } else {
          // Mostrar mensaje de error
          Swal.fire('Error', 'No se pudo eliminar la factura.', 'error');
        }
      } catch (error) {
        // Mostrar mensaje de error en caso de excepción
        Swal.fire('Error', 'Ocurrió un error al eliminar la factura: ' + error.message, 'error');
      }
    }
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
          <h1>eCommergy2</h1>
          <Img src={logoInstitucional} alt="Logo Institucional" boxSize="50px" />
        </Heading>
      </VStack>
      <Box p={5} backgroundColor="#3bb000" h="full">
        <Box display="flex" justifyContent="space-between" mb={4}>
          <Input 
            backgroundColor={'white'}
            borderColor='#525252'
            placeholder="Buscar facturas registradas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button 
          marginLeft={'0.3rem'} 
          color={'white'} 
          backgroundColor='#007832' 
          _hover={{backgroundColor:'#02652d'}} 
          _active={{ backgroundColor: '#003916' }} 
          onClick={() => { setSelectedFactura(null); onOpen(); }}>
            Nuevo
          </Button>
          <Button 
            left={'0.1rem'}
            w='7rem' 
            color='white' 
            backgroundColor='#C8102E'
            _hover={{backgroundColor:'#960000'}}
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
                <Th color={'white'}>Número Factura</Th>
                <Th color={'white'}>Fecha</Th>
                <Th color={'white'}>Sede</Th>
                <Th color={'white'}>Año Consumo</Th>
                <Th color={'white'}>Mes Consumo</Th>
                <Th color={'white'} isNumeric>
                  Cantidad <Text as="span" textTransform="lowercase">kWh</Text>
                </Th>
                <Th color={'white'} isNumeric>Valor Consumo</Th>
                <Th color={'white'}></Th>
              </Tr>
            </Thead>
            <Tbody backgroundColor={'white'}>
              {filteredFacturas.length > 0 ? (
                filteredFacturas.map((factura, index) => (
                  <Tr key={index}>
                    <Td>{factura.numeroFactura}</Td>
                    <Td>{new Date(factura.fecha).toISOString().split('T')[0]}</Td>
                    <Td>{sedes.find(sede => sede.idsede === factura.sede)?.nombre || 'Desconocida'}</Td>
                    <Td>{factura.anio}</Td>
                    <Td>{meses[factura.mes - 1]}</Td>
                    <Td isNumeric>{factura.cantidadKh}</Td>
                    <Td isNumeric>{factura.valorFactura}</Td>
                    <Td>
                      <Button 
                        size="sm" 
                        color={'white'} 
                        backgroundColor='#007832' 
                        _hover={{backgroundColor:'#02652d'}} 
                        _active={{ backgroundColor: '#003916' }} 
                        onClick={() => handleEdit(factura)}
                      >
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        color={'white'} 
                        backgroundColor='#FF0000' 
                        _hover={{backgroundColor:'#CC0000'}} 
                        _active={{ backgroundColor: '#990000' }} 
                        onClick={() => handleDelete(factura)}
                        marginLeft={'0.8rem'}
                      >
                        Borrar
                      </Button>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={8} textAlign="center">No se encontraron resultados</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedFactura ? 'Editar Factura' : 'Agregar Factura'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Facturas
                factura={selectedFactura}
                onClose={onClose}
                fetchFacturas={() => fetchFacturas()}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default BuscarFacturas;
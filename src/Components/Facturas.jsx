import React, { useState, useEffect } from 'react';
import { Box, Button, Input, FormControl, FormLabel, Select, VStack,HStack ,Grid} from "@chakra-ui/react";
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import localForage from 'localforage';

const Facturas = ({ factura, onClose }) => {
  const [operadores, setOperadores] = useState([]);
  const [valoresKH, setValoresKH] = useState([]);
  const [sedes, setSedes] = useState([]);
  
  const [idusuario, setIdusuario] = useState(null);
  const [error, setError] = useState(null);

  const [numeroFactura, setNumeroFactura] = useState(factura ? factura.numero_fac : '');
  const [operadorSeleccionado, setOperadorSeleccionado] = useState(factura ? factura.operador : '');
  const [sedeSeleccionada, setSedeSeleccionada] = useState(factura ? factura.sede : '');
  const [fecha, setFecha] = useState(factura ? new Date(factura.fecha) : new Date());
  const [anio, setAnio] = useState(factura ? factura.anio : new Date().getFullYear());
  const [mes, setMes] = useState(factura ? factura.mes : '');
  const [cantidadKH, setCantidadKH] = useState(factura ? factura.cantidadkh : '');
  const [valorKHSeleccionado, setValorKHSeleccionado] = useState(factura ? factura.valor_kwh : '');
  const [valorFactura, setValorFactura] = useState(factura ? factura.valor_factura : '');

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setIdusuario(storedUserId);
      console.log(localStorage.getItem('userId'));
    } else {
      console.error('No se encontró el idusuario en localStorage.');
      Swal.fire('Error', 'No se encontró el usuario. Por favor, inicie sesión nuevamente.', 'error');
    }
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/operadores')
      .then(response => response.json())
      .then(data => setOperadores(data))
      .catch(error => {
        onClose();
        console.error('Error fetching operadores:', error);
        Swal.fire('Error', 'Hubo un problema al obtener los operadores.', 'error');
      });
  }, []);
  
  useEffect(() => {
    fetch('http://localhost:3001/api/sedes')
      .then(response => response.json())
      .then(data => setSedes(data))
      .catch(error => {
        onClose();
        console.error('Error fetching sedes:', error);
        Swal.fire('Error', 'Hubo un problema al obtener las sedes.', 'error');
      });
  }, []);
  
  useEffect(() => {
    const fetchTarifas = async () => {
      if (operadorSeleccionado && sedeSeleccionada) {
        try {
          const response = await fetch(`http://localhost:3001/api/operadores_tarifa/${operadorSeleccionado}/${sedeSeleccionada}`);
          if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
          }
          const result = await response.json();
          setValoresKH(result.data); // Ajusta esto según la estructura de tu respuesta esperada
        } catch (error) {
          onClose();
          console.error('Error fetching valores kWh:', error.message);
          Swal.fire('Error', 'Hubo un problema al obtener los valores de kWh. Verifique la consola para más detalles.', 'error');
        }
      }
    };
    fetchTarifas();
  }, [operadorSeleccionado, sedeSeleccionada]);

  const handleGuardarFactura = () => {
    console.log('Operador Seleccionado:', operadorSeleccionado);
    console.log('Número de Factura:', numeroFactura);
    
    // Validación de campos antes de guardar
    if (!numeroFactura || !operadorSeleccionado || !sedeSeleccionada || !anio || !mes || !cantidadKH || !valorKHSeleccionado || !valorFactura) {
      onClose();
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }
  
    if (!idusuario) {
      onClose();
      Swal.fire('Error', 'No se encontró el usuario. Por favor, inicie sesión nuevamente.', 'error');
      return;
    }
  
    const data = {
      numerofac: numeroFactura,
      idoperador: parseInt(operadorSeleccionado, 10), // Convertir a entero
      sede: parseInt(sedeSeleccionada, 10), // Convertir a entero
      fecha: fecha.toISOString().split('T')[0], // Formato: YYYY-MM-DD
      anio: parseInt(anio, 10), // Convertir a entero
      mes: parseInt(mes, 10), // Convertir a entero
      cantidadkh: parseFloat(cantidadKH), // Convertir a float
      valor_kwh: parseFloat(valorKHSeleccionado), // Convertir a float
      valor_factura: parseFloat(valorFactura), // Convertir a float
      idusuario: parseInt(idusuario, 10) // Convertir a entero
    };
  
    console.log("Datos enviados:", data);
  
    // Aquí se cambia el endpoint para que use numerofac en vez de id
    const url = factura ? `http://localhost:3001/api/facturas/numerofac/${numeroFactura}` : 'http://localhost:3001/api/facturas';
    const method = factura ? 'PUT' : 'POST';  // Si factura existe, hacemos PUT, de lo contrario, POST.
  
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
      onClose();
      console.log("Resultado de la solicitud:", result);
      Swal.fire('Éxito', factura ? 'Factura actualizada correctamente' : 'Factura guardada correctamente', 'success');
    })
    .catch(error => {
      onClose();
      console.error('Error guardando la factura:', error);
      Swal.fire('Error', 'Hubo un problema al guardar la factura', 'error');
    });
  };
  

  return (
    <Box>
      <VStack spacing={4}>
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          {/* Selección de Operador */}
          <FormControl isRequired>
            <FormLabel>Operador de Energía</FormLabel>
            <Select
              backgroundColor={'white'}
              borderColor='#525252'
              placeholder="Seleccione un operador"
              onChange={e => setOperadorSeleccionado(e.target.value)} value={operadorSeleccionado}
            >
              {operadores.map(operador => (
                <option key={operador.idoperador} value={operador.idoperador}>
                  {operador.nombre}
                </option>
              ))}
            </Select>
          </FormControl>
          
          {/* Selección de Sede */}
          <FormControl isRequired>
            <FormLabel>Sede</FormLabel>
            <Select
              backgroundColor={'white'}
              borderColor='#525252'
              placeholder="Seleccione una sede"
              value={sedeSeleccionada}
              onChange={(e) => setSedeSeleccionada(e.target.value)}
            >
              {sedes.map(sede => (
                <option key={sede.idsede} value={sede.idsede}>
                  {sede.nombre}
                </option>
              ))}
            </Select>
          </FormControl>
          
          {/* Número de Factura */}
          <FormControl isRequired>
            <FormLabel>Número de Factura</FormLabel>
            <Input
              backgroundColor={'white'}
              borderColor='#525252'
              value={numeroFactura}
              onChange={(e) => setNumeroFactura(e.target.value)}
              placeholder="Ingrese número de factura"
              autoComplete="off"
            />
          </FormControl>

          {/* Fecha */}
          <FormControl>
            <FormLabel>Fecha</FormLabel>
            <DatePicker
              selected={fecha}
              onChange={(date) => setFecha(date)}
              dateFormat="dd/MM/yyyy"
            />
          </FormControl>
          
          {/* Año y Mes de Consumo */}
          <FormControl isRequired>
            <FormLabel>Año de Consumo</FormLabel>
            <Input
              backgroundColor={'white'}
              borderColor='#525252'
              type="number"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              placeholder="Ingrese año de consumo"
              min="1900"
              max={new Date().getFullYear()}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Mes de Consumo</FormLabel>
            <Select
              backgroundColor={'white'}
              borderColor='#525252'
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              placeholder="Seleccione un mes"
            >
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </Select>
          </FormControl>
          
          {/* Cantidad y Valor kWh */}
          <FormControl isRequired>
            <FormLabel>Cantidad kWh</FormLabel>
            <Input
              backgroundColor={'white'}
              borderColor='#525252'
              type="number"
              value={cantidadKH}
              onChange={(e) => setCantidadKH(e.target.value)}
              placeholder="Ingrese cantidad de kWh"
              min="0"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Valor kWh</FormLabel>
            <Select
              backgroundColor={'white'}
              borderColor='#525252'
              value={valorKHSeleccionado}
              onChange={(e) => setValorKHSeleccionado(e.target.value)}
              placeholder="Seleccione valor kWh"
            >
              {valoresKH.map(valor => (
                <option key={valor.idtarifa} value={valor.valorkh}>
                  {valor.valorkh}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Valor total factura */}
          <FormControl isRequired>
            <FormLabel>Valor Total Factura</FormLabel>
            <Input
              backgroundColor={'white'}
              borderColor='#525252'
              type="number"
              value={valorFactura}
              onChange={(e) => setValorFactura(e.target.value)}
              placeholder="Ingrese el valor total de la factura"
              min="0"
            />
          </FormControl>
        </Grid>

        <HStack justify="center" spacing={4}>
          <Button colorScheme="green" onClick={handleGuardarFactura}>Guardar Factura</Button>
          <Button colorScheme="red" onClick={onClose}>Cancelar</Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default Facturas;

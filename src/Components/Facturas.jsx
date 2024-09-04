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
  
  // Estado para guardar el idusuario
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
    // Obtener el idusuario desde localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setIdusuario(storedUserId);
    } else {
      console.error('No se encontró el idusuario en localStorage.');
      Swal.fire('Error', 'No se encontró el usuario. Por favor, inicie sesión nuevamente.', 'error');
    }
  }, []);

  useEffect(() => {
    // Obtener operadores
    fetch('http://localhost:3001/api/operadores')
      .then(response => response.json())
      .then(data => setOperadores(data))
      .catch(error => {
        console.error('Error fetching operadores:', error);
        Swal.fire('Error', 'Hubo un problema al obtener los operadores.', 'error');
      });
  }, []);
  
  useEffect(() => {
    // Obtener sedes
    fetch('http://localhost:3001/api/sedes')
      .then(response => response.json())
      .then(data => setSedes(data))
      .catch(error => {
        console.error('Error fetching sedes:', error);
        Swal.fire('Error', 'Hubo un problema al obtener las sedes.', 'error');
      });
  }, []);
  
  useEffect(() => {
    if (operadorSeleccionado && sedeSeleccionada) {
      // Obtener valores de kWh
      fetch(`http://localhost:3001/api/operadores_tarifa/${operadorSeleccionado}/${sedeSeleccionada}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Valores kWh:', data);
          setValoresKH(data); // Ajusta esto según la estructura de tu respuesta esperada
        })
        .catch(error => {
          console.error('Error fetching valores kWh:', error);
          Swal.fire('Error', 'Hubo un problema al obtener los valores de kWh.', 'error');
        });
    }
  }, [operadorSeleccionado, sedeSeleccionada]);
  
  

  const handleCantidadKHChange = (e) => {
    const cantidad = e.target.value;
    setCantidadKH(cantidad);
  };

  const handleValorKHChange = (e) => {
    setValorKHSeleccionado(e.target.value);
  };

  const handleGuardarFactura = () => {
    if (!idusuario) {
      Swal.fire('Error', 'No se ha encontrado el ID de usuario. Por favor, intente de nuevo.', 'error');
      return;
    }

    const data = {
      numero_fac: numeroFactura,
      operador: operadorSeleccionado,
      sede: sedeSeleccionada,
      fecha,
      anio,
      mes,
      cantidadkh: cantidadKH,
      valor_kwh: valorKHSeleccionado,
      valor_factura: valorFactura,
      idusuario
    };

    fetch('http://localhost:3001/api/facturas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
      Swal.fire('Éxito', 'Factura guardada correctamente', 'success');
      onClose(); // Cerrar el modal o el componente
    })
    .catch(error => {
      console.error('Error guardando la factura:', error);
      Swal.fire('Error', 'Hubo un problema al guardar la factura', 'error');
    });
  };

  return (
    <Box>
      <VStack spacing={4}>
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <FormControl>
            <FormLabel>Operador de Energía</FormLabel>
            <Select
              backgroundColor={'white'}
              borderColor='#525252'
              placeholder="Seleccione un operador"
              value={operadorSeleccionado}
              onChange={(e) => setOperadorSeleccionado(e.target.value)}
            >
              {operadores.map(operador => (
                <option key={operador.idoperador} value={operador.idoperador}>
                  {operador.nombre}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
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
          <FormControl>
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
          <FormControl>
            <FormLabel>Fecha</FormLabel>
            <DatePicker
              selected={fecha}
              onChange={(date) => setFecha(date)}
              dateFormat="dd/MM/yyyy"
            />
          </FormControl>
          <FormControl>
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
          <FormControl>
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
          <FormControl>
            <FormLabel>Cantidad kWh</FormLabel>
            <Input
              backgroundColor={'white'}
              borderColor='#525252'
              type="number"
              value={cantidadKH}
              onChange={handleCantidadKHChange}
              placeholder="Ingrese cantidad de kWh"
              min="0"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Valor kWh</FormLabel>
            <Select
              backgroundColor={'white'}
              borderColor='#525252'
              value={valorKHSeleccionado}
              onChange={handleValorKHChange}
              placeholder="Seleccione un valor kWh"
            >
              {valoresKH.map(valor => (
                <option key={valor.idtarifa} value={valor.valor_kwh}>
                  {valor.valor_kwh}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Valor Factura</FormLabel>
            <Input
              backgroundColor={'white'}
              borderColor='#525252'
              type="number"
              value={valorFactura}
              onChange={(e) => setValorFactura(e.target.value)}
              placeholder="Ingrese valor de la factura"
              min="0"
            />
          </FormControl>
        </Grid>
        <Button colorScheme="teal" onClick={handleGuardarFactura}>
          Guardar Factura
        </Button>
      </VStack>
    </Box>
  );
};

export default Facturas;

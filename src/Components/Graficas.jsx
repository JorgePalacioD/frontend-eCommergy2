import { Box, VStack, Img, Heading ,Select, Button} from "@chakra-ui/react";
import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import logoEmpresa from '../assests/logoECommergy2-removebg-preview.png';
import logoInstitucional from '../assests/logo-sena-verde-complementario-png-2022.png';
import { useNavigate } from 'react-router-dom';
import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Text
} from '@chakra-ui/react'


const Graficas = () => {
  const navigate = useNavigate();

  const [tarifas, setTarifas] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [selectedOption, setSelectedOption] = useState('tarifas'); // Estado para el select
  const [selectedOptionAnio, setSelectedOptionAnio] = useState(new Date().getFullYear()); // Estado para el select de año
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const anios = Array.from({ length: 2 }, (_, i) => new Date().getFullYear() - i); // 2 años hacia atrás

  const handleHome = async () => {
    navigate('/home');
  }
  useEffect(() => {
    
    const fetchSedes = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/sedes');
        if (!response.ok) throw new Error('Error en la respuesta de la API');
        const result = await response.json();
        if (Array.isArray(result)) setSedes(result);
        else console.error('Datos de sedes no son un arreglo o respuesta incorrecta:', result);
      } catch (error) {
        console.error('Error fetching sedes:', error);
      }
    };

    const fetchOperadores = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/operadores');
        if (!response.ok) throw new Error('Error en la respuesta de la API');
        const result = await response.json();
        if (Array.isArray(result)) setOperadores(result);
        else console.error('Datos de operadores no son un arreglo o respuesta incorrecta:', result);
      } catch (error) {
        console.error('Error fetching operadores:', error);
      }
    };

    const fetchTarifas = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/operadores_tarifas');
        if (!response.ok) throw new Error('Error en la respuesta de la API');
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) setTarifas(result.data);
        else console.error('Datos de tarifas no son un arreglo o respuesta incorrecta:', result);
      } catch (error) {
        console.error('Error fetching tarifas:', error);
      }
    };

    const fetchFacturas = async () => {
      try {
          console.log("Fetching facturas for year:", selectedOptionAnio); // Para verificar el año
          const response = await fetch(`http://localhost:3001/api/facturas/anio/${selectedOptionAnio}`);
          
          if (!response.ok) throw new Error('Error en la respuesta de la API');
  
          const result = await response.json();
  
          // Verificar si el resultado es un arreglo
          if (Array.isArray(result)) {
              console.log("Facturas obtenidas:", result); // Para ver qué datos llegan
              setFacturas(result);
          } else {
              console.error('Datos de facturas no son un arreglo o respuesta incorrecta:', result);
          }
      } catch (error) {
          console.error('Error fetching facturas:', error);
      }
  };
  

    fetchSedes();
    fetchOperadores();
    fetchTarifas();
    fetchFacturas();
  }, [selectedOptionAnio]);

  const calculateSumsByOperator = () => {
    const facturasPorOperadorDiferencia = {};
    

    facturas.forEach(factura => {
      const operador = operadores.find(o => o.idoperador === factura.idoperador)?.nombre || `Operador ${factura.idoperador}`;
      const sede = sedes.find(s => s.idsede === factura.sede)?.nombre || `Sede ${factura.sede}`;
      const clave = `${operador} - ${sede}`;
      if (!facturasPorOperadorDiferencia[clave]) {
        facturasPorOperadorDiferencia[clave] = 0;
      }
      facturasPorOperadorDiferencia[clave] += factura.valor_factura;
    });

    return facturasPorOperadorDiferencia;
  };

  const facturasPorOperadorDiferencia = calculateSumsByOperator();

  // Suponiendo que deseas comparar dos operadores específicos:
  const operador1 = 'EDEQ Grupo EPM - Comercio y Servicio'; // Nombre del primer operador
  const operador2 = 'NEU Energy - Comercio y Servicio'; // Nombre del segundo operador
  const valorOperador1 = facturasPorOperadorDiferencia[operador1] || 0;
  const valorOperador2 = facturasPorOperadorDiferencia[operador2] || 0;
  const diferencia = valorOperador1 - valorOperador2;

  const operador3 = 'EDEQ Grupo EPM - Turismo y Gastronomia'; // Nombre del primer operador
  const operador4 = 'NEU Energy - Turismo y Gastronomia'; // Nombre del segundo operador
  const valorOperador3 = facturasPorOperadorDiferencia[operador3] || 0;
  const valorOperador4 = facturasPorOperadorDiferencia[operador4] || 0;
  const diferencia2 = valorOperador3 - valorOperador4;

  const formatNumber = (value) => {
    return Intl.NumberFormat().format(value);
  };

  const tarifasPorOperador = {};
  const tarifasPorSede = {};
  const facturasPorSedeYMes = {};
  const facturasPorOperador = {};

  tarifas.forEach(tarifa => {
    const mes = meses[tarifa.mes - 1];
    const operador = operadores.find(o => o.idoperador === tarifa.idoperador)?.nombre || `Operador ${tarifa.idoperador}`;
    const sede = sedes.find(s => s.idsede === tarifa.idsede)?.nombre || `Sede ${tarifa.idsede}`;
    const clave = `${operador} - ${sede}`;

    if (!tarifasPorOperador[clave]) {
      tarifasPorOperador[clave] = Array(meses.length).fill(0);
    }
    tarifasPorOperador[clave][meses.indexOf(mes)] = tarifa.valorkh;

    if (!tarifasPorSede[clave]) {
      tarifasPorSede[clave] = Array(meses.length).fill(0);
    }
    tarifasPorSede[clave][meses.indexOf(mes)] = tarifa.valorkh;
  });

  facturas.forEach(factura => {
    const mes = meses[factura.mes - 1];
    const operador = operadores.find(o => o.idoperador === factura.idoperador)?.nombre || `Operador ${factura.idoperador}`;
    const sede = sedes.find(s => s.idsede === factura.sede)?.nombre || `Sede ${factura.sede}`;
    const clave = `${operador} - ${sede}`;

    if (!facturasPorOperador[clave]) {
      facturasPorOperador[clave] = Array(meses.length).fill(0);
    }
    facturasPorOperador[clave][meses.indexOf(mes)] += factura.valor_factura;

    if (!facturasPorSedeYMes[clave]) {
      facturasPorSedeYMes[clave] = Array(meses.length).fill(0);
    }
    facturasPorSedeYMes[clave][meses.indexOf(mes)] = factura.valor_factura;
  });

  const seriesOperadores = Object.keys(tarifasPorOperador).map(operador => ({
    name: operador,
    data: tarifasPorOperador[operador]
  }));

  const seriesSedes = Object.keys(tarifasPorSede).map(sede => ({
    name: sede,
    data: tarifasPorSede[sede]
  }));

  const seriesFacturas = Object.keys(facturasPorSedeYMes).map(sede => ({
    name: sede,
    data: facturasPorSedeYMes[sede]
  }));

  // Crear la serie para las facturas por operador
  const seriesFacturasOperador = Object.keys(facturasPorOperador).map(operador => ({
    name: operador,
    data: facturasPorOperador[operador]
  }));

  const tarifasOptionsOperadores = {
    chart: { id: "tarifas-chart-operadores" },
    xaxis: { categories: meses },
    title: { text: 'Valor de tarifas en lineas', align: 'center' },
    yaxis: {
      labels: {
        formatter: (value) => formatNumber(value) // Mostrar en miles
      },
      max: 1000
    },
    tooltip: {
      y: {
        formatter: (value) => `${formatNumber(value)} kWh` // Tooltip en miles
      }
    },
    plotOptions: {
      line: {
        curve: 'smooth' // Suavizar las líneas
      }
    },
    legend: {
      position: 'top'
    }
  };

  const tarifasOptionsSedes = {
    chart: { id: "tarifas-chart-sedes" },
    xaxis: { categories: meses },
    title: { text: 'Valor de tarifas en barras', align: 'center' },
    yaxis: {
      labels: {
        formatter: (value) => formatNumber(value) // Mostrar en miles
      },
    min: 100,
    max: 1000
    },
    tooltip: {
      y: {
        formatter: (value) => `${formatNumber(value)} kWh` // Tooltip en miles
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '100%', // Ajusta el ancho de las barras
        endingShape: 'rounded'
      }
    },
    legend: {
      position: 'top'
    },
    dataLabels: {
      enabled: false
    }
  };

  const facturasOptionsLinea = {
    chart: { id: "facturas-chart-linea", type: 'line' },
    xaxis: { categories: meses },
    title: { text: 'Valor de Facturas en Linea', align: 'center' },
    yaxis: {
      labels: {
        formatter: (value) => formatNumber(value) // Mostrar en miles
      },
      min: 1000000,
      max: 20000000
    },
    tooltip: {
      y: {
        formatter: (value) => `${formatNumber(value)}$` // Tooltip en miles
      }
    },
    plotOptions: {
      line: {
        curve: 'smooth' // Suavizar las líneas
      }
    },
    legend: {
      position: 'top'
    }
  };

  const facturasOptionsBarras = {
    chart: { id: "facturas-chart-barras", type: 'bar' },
    xaxis: { categories: meses },
    title: { text: 'Valor de Facturas en Barra', align: 'center' },
    yaxis: {
      labels: {
        formatter: (value) => formatNumber(value) // Mostrar en miles
      },
      min: 1000000,
      max: 20000000
    },
    tooltip: {
      y: {
        formatter: (value) => `${formatNumber(value)}$` // Tooltip en miles
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '100%', // Ajusta el ancho de las barras
        endingShape: 'rounded'
      }
    },
    legend: {
      position: 'top'
    },
    dataLabels: {
      enabled: false // Desactivar los valores sobre las barras
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

      <Box p={5} backgroundColor="#3bb000" h="auto" display={'flex'} flexDirection={'column'} alignItems={'center'}>
        <Box display={'flex'} justifyContent={'revert'}>
          <Select 
            backgroundColor={'white'}
            value={selectedOption} 
            onChange={(e) => setSelectedOption(e.target.value)} 
            mb={4}
            w="200px"
            left={'4rem'}
          >
            <option value="tarifas">Tarifas</option>
            <option value="facturas">Facturas</option>
          </Select>
          <Button 
            left={'30rem'}
            w='8rem' 
            color='white' 
            backgroundColor='#C8102E'
            _hover={{backgroundColor:'#960000'}}
            _active={{ backgroundColor: '#6d0000' }}
            onClick={handleHome}
          >
            Regresar
          </Button>
        </Box>

        {selectedOption === 'tarifas' && (
          <>
            <Box p={5} backgroundColor="#ecf1f2" w={'80%'}>
              <Chart
                options={tarifasOptionsOperadores}
                series={seriesOperadores}
                type="line"
                width="100%"
                height="400"
              />
            </Box>
            <Box p={5} backgroundColor="#ecf1f2" w={'80%'}>
              <Chart
                options={tarifasOptionsSedes}
                series={seriesSedes}
                type="bar"
                width="100%"
                height="400"
              />
            </Box>
          </>
        )}

        {selectedOption === 'facturas' && (
          
          <Box p={5} backgroundColor="#ecf1f2" w={'80%'}>
            <Select 
              backgroundColor={'white'}
              value={selectedOptionAnio} 
              onChange={(e) => setSelectedOptionAnio(e.target.value)} 
              mb={4}
              w="200px"
              left={'4rem'}
            >
              {anios.map((anio) => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </Select>
            <Chart
              options={facturasOptionsLinea}
              series={seriesFacturasOperador} // Usar la serie correcta aquí
              type="line"
              height={400}
            />
            <Chart
              options={facturasOptionsBarras}
              series={seriesFacturas}
              type="bar"
              height={400}
            />
            <Box >
              <Box >
                <Box textAlign={'center'}>
                <Text fontWeight="bold" fontSize="xl">Facturacion Anual por Comercializador</Text>
                </Box>
                      <Box
                      display={'flex'}
                      justifyContent={'space-between'}
                      >
                          <StatGroup marginBottom={'1rem'}>
                          {Object.keys(facturasPorOperador).map((operador, index) => {
                        const totalFacturaSede = facturasPorOperador[operador].reduce((acc, valor) => acc + valor, 0);
                        return (
                            <Stat marginLeft={'8rem'} key={index}>
                              <StatLabel w={'20rem'}>{operador}</StatLabel>
                              <StatNumber>{formatNumber(totalFacturaSede)} $</StatNumber>
                            </Stat>
                            );
                          })}
                          </StatGroup>
                      </Box>
                  </Box>
                  <Box textAlign={'center'}>
                    <Text fontWeight="bold" fontSize="xl">Diferencia entre Comercializadoras</Text>
                  </Box>
                  <StatGroup>
                      <Stat>
                        <StatLabel>{operador1}</StatLabel>
                        <StatNumber>{formatNumber(valorOperador1)}$</StatNumber>
                      </Stat>

                      <Stat>
                        <StatLabel>{operador2}</StatLabel>
                        <StatNumber>{formatNumber(valorOperador2)}$</StatNumber>
                      </Stat>

                      <Stat>
                        <StatLabel>Diferencia</StatLabel>
                        <StatNumber >
                          {formatNumber(Math.abs(diferencia))}$
                        </StatNumber>
                        <StatHelpText>
                        {valorOperador1 >= valorOperador2 ? "Ahorro en "+operador2 : "Ahorro en" +operador1}
                        </StatHelpText>
                      </Stat>
                  </StatGroup>
                  <StatGroup>
                      <Stat>
                        <StatLabel>{operador3}</StatLabel>
                        <StatNumber>{formatNumber(valorOperador3)}$</StatNumber>
                      </Stat>

                      <Stat>
                        <StatLabel>{operador4}</StatLabel>
                        <StatNumber>{formatNumber(valorOperador4)}$</StatNumber>
                      </Stat>

                      <Stat>
                        <StatLabel>Diferencia</StatLabel>
                        <StatNumber >
                          {formatNumber(Math.abs(diferencia2))}$
                        </StatNumber>
                        <StatHelpText>
                          {valorOperador3 >= valorOperador4 ? "Ahorro en "+operador4  : "Ahorro en" +operador3}
                        </StatHelpText>
                      </Stat>
                  </StatGroup>
              
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Graficas;
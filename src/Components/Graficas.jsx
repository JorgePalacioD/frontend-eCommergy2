import { Box, VStack, Img, Heading ,Select, Button} from "@chakra-ui/react";
import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import logoEmpresa from '../assests/logoECommergy2-removebg-preview.png';
import logoInstitucional from '../assests/logo-sena-verde-complementario-png-2022.png';
import { useNavigate } from 'react-router-dom';


const Graficas = () => {
  const navigate = useNavigate();

  const [tarifas, setTarifas] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [selectedOption, setSelectedOption] = useState('tarifas'); // Estado para el select
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];


  const handleHome = async () => {
    navigate('/home');
  }
  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/sedes');
        if (!response.ok) {
          throw new Error('Error en la respuesta de la API');
        }
        const result = await response.json();
        if (Array.isArray(result)) {
          setSedes(result);
        } else {
          console.error('Datos de sedes no son un arreglo o respuesta incorrecta:', result);
        }
      } catch (error) {
        console.error('Error fetching sedes:', error);
      }
    };

    const fetchOperadores = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/operadores');
        if (!response.ok) {
          throw new Error('Error en la respuesta de la API');
        }
        const result = await response.json();
        if (Array.isArray(result)) {
          setOperadores(result);
        } else {
          console.error('Datos de operadores no son un arreglo o respuesta incorrecta:', result);
        }
      } catch (error) {
        console.error('Error fetching operadores:', error);
      }
    };

    const fetchTarifas = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/operadores_tarifas');
        if (!response.ok) {
          throw new Error('Error en la respuesta de la API');
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setTarifas(result.data);
        } else {
          console.error('Datos de tarifas no son un arreglo o respuesta incorrecta:', result);
        }
      } catch (error) {
        console.error('Error fetching tarifas:', error);
      }
    };

    const fetchFacturas = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/facturas'); // Asume que tienes un endpoint para las facturas
        if (!response.ok) {
          throw new Error('Error en la respuesta de la API');
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          console.log(result.data); // Verifica los datos en la consola
          setFacturas(result.data);
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
  }, []);

  // Preparar las categorías (meses) y las series (tarifas individuales) para operadores
  const categories = meses;
  const seriesOperadores = [];
  const seriesSedes = [];
  const seriesFacturas = [];

  // Crear un mapa para almacenar las tarifas por operador y sede
  const tarifasPorOperador = {};
  const tarifasPorSede = {};
  const facturasPorSedeYMes = {};

  // Inicializar los mapas
  tarifas.forEach(tarifa => {
    const mes = meses[tarifa.mes - 1];
    const operador = operadores.find(o => o.idoperador === tarifa.idoperador)?.nombre || `Operador ${tarifa.idoperador}`;
    const sede = sedes.find(s => s.idsede === tarifa.idsede)?.nombre || `Sede ${tarifa.idsede}`;

    // Inicializar arrays para operadores
    if (!tarifasPorOperador[operador]) {
      tarifasPorOperador[operador] = Array(meses.length).fill(0);
    }
    tarifasPorOperador[operador][meses.indexOf(mes)] = tarifa.valorkh;

    // Inicializar arrays para sedes
    if (!tarifasPorSede[sede]) {
      tarifasPorSede[sede] = Array(meses.length).fill(0);
    }
    tarifasPorSede[sede][meses.indexOf(mes)] = tarifa.valorkh;
  });

  // Inicializar facturas por sede y mes
  facturas.forEach(factura => {
    const mes = meses[factura.mes - 1];
    const sede = sedes.find(s => s.idsede === factura.sede)?.nombre || `Sede ${factura.sede}`;
    if (!facturasPorSedeYMes[sede]) {
      facturasPorSedeYMes[sede] = Array(meses.length).fill(0);
    }
    facturasPorSedeYMes[sede][meses.indexOf(mes)] = factura.valor_factura; // Asegúrate de usar 'valor_factura'
  });

  // Crear series para cada operador
  Object.keys(tarifasPorOperador).forEach(operador => {
    seriesOperadores.push({
      name: operador,
      data: tarifasPorOperador[operador]
    });
  });

  // Crear series para cada sede
  Object.keys(tarifasPorSede).forEach(sede => {
    seriesSedes.push({
      name: sede,
      data: tarifasPorSede[sede]
    });
  });

  // Crear series para facturas por sede
  Object.keys(facturasPorSedeYMes).forEach(sede => {
    seriesFacturas.push({
      name: sede,
      data: facturasPorSedeYMes[sede]
    });
  });

  const tarifasOptionsOperadores = {
    chart: { id: "tarifas-chart-operadores" },
    xaxis: { categories: categories },
    title: { text: 'Valor de tarifas por mes y operador', align: 'center' },
    yaxis: {
      labels: {
        formatter: (value) => value.toFixed(2) // Mostrar solo dos decimales en el eje Y
      }
    },
    tooltip: {
      y: {
        formatter: (value) => `${value.toFixed(2)} kWh` // Tooltip con dos decimales
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
    xaxis: { categories: categories },
    title: { text: 'Valor de tarifas por mes y sede', align: 'center' },
    yaxis: {
      labels: {
        formatter: (value) => value.toFixed(0) // Mostrar solo dos decimales en el eje Y
      }
    },
    tooltip: {
      y: {
        formatter: (value) => `${value.toFixed(2)} kWh` // Tooltip con dos decimales
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
    }
  };

  const facturasOptions = {
    chart: { id: "facturas-chart" },
    xaxis: { categories: categories },
    title: { text: 'Valor de facturas por mes y sede', align: 'center' },
    yaxis: {
      labels: {
        formatter: (value) => value.toFixed(0) // Mostrar solo dos decimales en el eje Y
      }
    },
    tooltip: {
      y: {
        formatter: (value) => `${value}$` // Tooltip con dos decimales
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
      
      <Box p={5} backgroundColor="#3bb000" h="auto"
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        alignContent={'center'}>
        
        <Box
        display={'flex'}
        justifyContent={'revert'}
        >
        
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
        
        


        {/* Renderizar gráficos basados en la selección */}
        {selectedOption === 'tarifas' && (
          <>
            {/* Gráfico de tarifas individuales por mes y operador */}
            <Box p={5} backgroundColor="#ecf1f2" w={'80%'}>
              <Chart
                options={tarifasOptionsOperadores}
                series={seriesOperadores}
                type="line"
                width="100%"
                height="400"
              />
            </Box>

            {/* Gráfico de tarifas individuales por mes y sede */}
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
            <Chart
              options={facturasOptions}
              series={seriesFacturas}
              type="bar"
              width="100%"
              height="400"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Graficas;
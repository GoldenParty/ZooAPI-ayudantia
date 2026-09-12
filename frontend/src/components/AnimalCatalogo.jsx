import { useState, useEffect } from 'react';
import { API_URL } from '../api/config';

function AnimalCatalogo() {
  // =====================================================
  // ESTADOS DEL CATÁLOGO
  // =====================================================

  const [animales, setAnimales] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [recintos, setRecintos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [especieFiltro, setEspecieFiltro] = useState('');
  const [recintoFiltro, setRecintoFiltro] = useState('');

  // Animal seleccionado
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);

  // Comentarios
  const [comentarios, setComentarios] = useState([]);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);
  const [errorComentarios, setErrorComentarios] = useState(null);

  // Formulario de comentario
  const [autor, setAutor] = useState('');
  const [calificacion, setCalificacion] = useState('');
  const [comentario, setComentario] = useState('');

  const [errorFormulario, setErrorFormulario] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [enviandoComentario, setEnviandoComentario] = useState(false);


  // =====================================================
  // CARGAR ESPECIES Y RECINTOS
  // =====================================================

  useEffect(() => {
    fetch(`${API_URL}/especies`)
      .then((res) => res.json())
      .then((data) => {
        setEspecies(data);
      })
      .catch(() => {
        console.log('No se pudieron cargar las especies');
      });

    fetch(`${API_URL}/recintos`)
      .then((res) => res.json())
      .then((data) => {
        setRecintos(data);
      })
      .catch(() => {
        console.log('No se pudieron cargar los recintos');
      });
  }, []);


  // =====================================================
  // 1 Y 2. LISTADO DE ANIMALES + FILTROS
  //
  // GET /animals
  // GET /animals?especieId=X
  // GET /animals?recintoId=X
  //
  // Este useEffect depende de los filtros.
  // Por eso se vuelve a ejecutar cuando cambia alguno.
  // =====================================================

  useEffect(() => {
    setCargando(true);

    const parametros = new URLSearchParams();

    if (especieFiltro !== '') {
      parametros.append('especieId', especieFiltro);
    }

    if (recintoFiltro !== '') {
      parametros.append('recintoId', recintoFiltro);
    }

    const query = parametros.toString();

    const url = query
      ? `${API_URL}/animals?${query}`
      : `${API_URL}/animals`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error();
        }

        return res.json();
      })
      .then((data) => {
        setAnimales(data);
        setError(null);
        setCargando(false);
      })
      .catch(() => {
        setError('No se pudo conectar con el servidor');
        setCargando(false);
      });
  }, [especieFiltro, recintoFiltro]);


  // =====================================================
  // 3. SELECCIONAR ANIMAL
  //
  // GET /animals/:id/comments
  // =====================================================

  const seleccionarAnimal = (animal) => {
    setAnimalSeleccionado(animal);

    setComentarios([]);
    setErrorComentarios(null);

    setCargandoComentarios(true);

    // Limpiamos mensajes anteriores
    setErrorFormulario(null);
    setMensajeExito(null);

    fetch(`${API_URL}/animals/${animal.id}/comments`)
      .then((res) => {
        if (!res.ok) {
          throw new Error();
        }

        return res.json();
      })
      .then((data) => {
        setComentarios(data);
        setCargandoComentarios(false);
      })
      .catch(() => {
        setErrorComentarios(
          'No se pudieron cargar los comentarios'
        );

        setCargandoComentarios(false);
      });
  };


  // =====================================================
  // 4. CREAR COMENTARIO
  //
  // POST /animals/:id/comments
  // =====================================================

  const crearComentario = (e) => {
    e.preventDefault();

    setErrorFormulario(null);
    setMensajeExito(null);
    setEnviandoComentario(true);

    fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        autor: autor,
        calificacion: Number(calificacion),
        comentario: comentario,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        // Error de validación de Zod
        if (res.status === 400) {
          throw new Error(
            data.error || 'Los datos ingresados no son válidos'
          );
        }

        if (!res.ok) {
          throw new Error(
            data.error || 'No se pudo crear el comentario'
          );
        }

        return data;
      })
      .then((nuevoComentario) => {
        setComentarios((comentariosActuales) => [
          ...comentariosActuales,
          nuevoComentario,
        ]);

        // Limpiar formulario
        setAutor('');
        setCalificacion('');
        setComentario('');

        setMensajeExito('Comentario creado correctamente');
        setEnviandoComentario(false);
      })
      .catch((err) => {
        setErrorFormulario(err.message);
        setEnviandoComentario(false);
      });
  };


  // =====================================================
  // CARGANDO
  // =====================================================

  if (cargando) {
    return <p>Cargando animales...</p>;
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return <p>{error}</p>;
  }


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div>

      <h2>Catálogo de Animales</h2>


      {/* =================================================
          FILTROS
          ================================================= */}

      <div>

        <label>
          Especie:{' '}

          <select
            value={especieFiltro}
            onChange={(e) => setEspecieFiltro(e.target.value)}
          >
            <option value="">
              Todas las especies
            </option>

            {especies.map((especie) => (
              <option
                key={especie.id}
                value={especie.id}
              >
                {especie.nombre}
              </option>
            ))}
          </select>
        </label>


        {'   '}


        <label>
          Recinto:{' '}

          <select
            value={recintoFiltro}
            onChange={(e) => setRecintoFiltro(e.target.value)}
          >
            <option value="">
              Todos los recintos
            </option>

            {recintos.map((recinto) => (
              <option
                key={recinto.id}
                value={recinto.id}
              >
                {recinto.nombre}
              </option>
            ))}
          </select>
        </label>

      </div>


      <hr />


      {/* =================================================
          LISTADO DE ANIMALES
          ================================================= */}

      <h3>Animales</h3>

      {animales.length === 0 ? (
        <p>
          No hay animales que coincidan con los filtros.
        </p>
      ) : (

        <ul>

          {animales.map((animal) => (

            <li key={animal.id}>

              <button
                onClick={() => seleccionarAnimal(animal)}
              >
                {animal.nombre}
              </button>

              {' — '}

              {animal.especie?.nombre || 'Sin especie'}

              {' — '}

              {animal.recinto?.nombre || 'Sin recinto'}

            </li>

          ))}

        </ul>

      )}


      {/* =================================================
          DETALLE DEL ANIMAL
          ================================================= */}

      {animalSeleccionado && (

        <div>

          <hr />

          <h2>
            Detalle del animal
          </h2>

          <p>
            <strong>Nombre:</strong>{' '}
            {animalSeleccionado.nombre}
          </p>

          <p>
            <strong>Edad:</strong>{' '}
            {animalSeleccionado.edad} años
          </p>

          <p>
            <strong>Peso:</strong>{' '}
            {animalSeleccionado.peso ?? 'No registrado'}
          </p>

          <p>
            <strong>Disponible:</strong>{' '}
            {animalSeleccionado.disponible
              ? 'Sí'
              : 'No'}
          </p>

          <p>
            <strong>Especie:</strong>{' '}
            {animalSeleccionado.especie?.nombre}
          </p>

          <p>
            <strong>Recinto:</strong>{' '}
            {animalSeleccionado.recinto?.nombre}
          </p>


          {/* =================================================
              COMENTARIOS
              ================================================= */}

          <h3>
            Comentarios
          </h3>


          {cargandoComentarios && (
            <p>
              Cargando comentarios...
            </p>
          )}


          {errorComentarios && (
            <p>
              {errorComentarios}
            </p>
          )}


          {!cargandoComentarios &&
            !errorComentarios &&
            comentarios.length === 0 && (
              <p>
                Este animal todavía no tiene comentarios.
              </p>
            )}


          {!cargandoComentarios &&
            comentarios.length > 0 && (

              <ul>

                {comentarios.map((comentario) => (

                  <li key={comentario.id}>

                    <strong>
                      {comentario.autor}
                    </strong>

                    {' — '}

                    <strong>
                      {comentario.calificacion}/5
                    </strong>

                    {' — '}

                    {comentario.comentario}

                  </li>

                ))}

              </ul>

            )}


          {/* =================================================
              FORMULARIO DE COMENTARIO
              ================================================= */}

          <h3>
            Agregar comentario
          </h3>


          <form onSubmit={crearComentario}>

            {/* Autor */}

            <div>

              <label>
                Autor:{' '}

                <input
                  type="text"
                  value={autor}
                  onChange={(e) =>
                    setAutor(e.target.value)
                  }
                  required
                />
              </label>

            </div>


            <br />


            {/* Calificación */}

            <div>

              <label>
                Calificación:{' '}

                <select
                  value={calificacion}
                  onChange={(e) =>
                    setCalificacion(e.target.value)
                  }
                  required
                >

                  <option value="">
                    Selecciona una calificación
                  </option>

                  <option value="1">
                    1/5
                  </option>

                  <option value="2">
                    2/5
                  </option>

                  <option value="3">
                    3/5
                  </option>

                  <option value="4">
                    4/5
                  </option>

                  <option value="5">
                    5/5
                  </option>

                </select>
              </label>

            </div>


            <br />


            {/* Comentario */}

            <div>

              <label>
                Comentario:{' '}

                <textarea
                  value={comentario}
                  onChange={(e) =>
                    setComentario(e.target.value)
                  }
                  required
                  placeholder="Escribe al menos 10 caracteres"
                />

              </label>

            </div>


            <br />


            <button
              type="submit"
              disabled={enviandoComentario}
            >
              {enviandoComentario
                ? 'Enviando...'
                : 'Enviar comentario'}
            </button>

          </form>


          {/* =================================================
              ERROR 400 DE ZOD PTA LA WEA
              ================================================= */}

          {errorFormulario && (

            <p>
              <strong>Error:</strong>{' '}
              {errorFormulario}
            </p>

          )}


          {/* =================================================
              MENSAJE DE exito XD
              ================================================= */}

          {mensajeExito && (

            <p>
              {mensajeExito}
            </p>

          )}

        </div>

      )}

    </div>
  );
}

export default AnimalCatalogo;
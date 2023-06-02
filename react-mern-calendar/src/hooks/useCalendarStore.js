import { useDispatch, useSelector } from 'react-redux';
import { onAddNewEvent, onDeleteEvent, onSetActiveEvent, onUpdateEvent, onLoadEvents } from '../store';
import { calendarApi } from '../api';
import { convertEventsToDateEvents } from '../helpers';
import Swal from 'sweetalert2';


export const useCalendarStore = () => {
  
    const dispatch = useDispatch();
    const { events, activeEvent } = useSelector( state => state.calendar );
    const { user } = useSelector( state => state.auth );

    const setActiveEvent = ( calendarEvent ) => {
        dispatch( onSetActiveEvent( calendarEvent ) )
    }

    const startSavingEvent = async( calendarEvent ) => {
        
        try {

            // Todo bien
            if( calendarEvent.id ) {
                // Actualizando
                const { data } = await calendarApi.put(`/events/${ calendarEvent.id }`, calendarEvent)
                dispatch( onUpdateEvent({ ...calendarEvent, user }) );
                Swal.fire('Evento actualizado exitosamente', data.msg, 'success');
                return;
    
            } 
    
            // Creando el eventos
            const { data } = await calendarApi.post('/events', calendarEvent );
            dispatch( onAddNewEvent({ ...calendarEvent, id: data.evento.id, user }) );
            Swal.fire('Evento creado exitosamente', data.msg, 'success');
            
        } catch (error) {
            console.log(error);
            Swal.fire('Error al guardar', error.response.data.msg, 'error');
        }

    }

    const startDeletingEvent = async () => {
        // Todo: Llegar al backend
        try {
            await calendarApi.delete(`/events/${ activeEvent.id }` );
            dispatch( onDeleteEvent() );
            Swal.fire('Elemento eliminado correctamente', 'El evento se ha eliminado correctamente', 'success');
        } catch (error) {
            console.log(error);
            Swal.fire('Error al eliminar', error.response.data.msg, 'error');
        }
    }

    const startLoadingEvents = async() => {
        try {
            
            const { data } = await calendarApi.get('/events');
            const events = convertEventsToDateEvents( data.eventos );
            dispatch( onLoadEvents( events ) );


        } catch (error) {
          console.log('Error cargando eventos');
          console.log(error)
        }
    }


    return {
        //* Propiedades
        activeEvent,
        events,
        hasEventSelected: !!activeEvent,

        //* Métodos
        startDeletingEvent,
        setActiveEvent,
        startLoadingEvents,
        startSavingEvent,
    }
}

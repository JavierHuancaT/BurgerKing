import { Component } from '@angular/core';

interface Sede {
  nombre: string;
  direccion: string;
  comuna: string;
  horario: string;
  telefono: string;
  imgUrl: string;
  mapaUrl: string;
}

@Component({
  selector: 'app-restaurantes',
  templateUrl: './restaurantes.component.html',
  styleUrls: ['./restaurantes.component.css']
})
export class RestaurantesComponent {

  sedes: Sede[] = [
    {
      nombre: 'BK Mall Plaza Arica',
      direccion: 'Av. Diego Portales 640 (Patio de Comidas)',
      comuna: 'Arica',
      horario: 'Lun-Dom: 10:30 - 21:30',
      telefono: '+56 58 232 5000',
      // Foto: Una hamburguesa grande estilo Whopper a la parrilla
      imgUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80',
      mapaUrl: 'https://www.google.com/maps/search/?api=1&query=Mall+Plaza+Arica+Av.+Diego+Portales+640'
    },
    {
      nombre: 'BK Alameda (Metro U. Chile)',
      direccion: 'Av. Libertador Bernardo O\'Higgins 929',
      comuna: 'Santiago Centro',
      horario: 'Lun-Dom: 09:30 - 21:00',
      telefono: '+56 2 2636 2850',
      // Foto: Combo clásico de hamburguesa doble con papas fritas
      imgUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80',
      mapaUrl: 'https://www.google.com/maps/search/?api=1&query=Av.+Libertador+Bernardo+O\'Higgins+929+Santiago'
    },
    {
      nombre: 'BK Providencia (Manuel Montt)',
      direccion: 'Av. Providencia 1321',
      comuna: 'Providencia',
      horario: 'Lun-Jue: 10:00 - 22:00 | Vie-Sab: 10:00 - 23:00',
      telefono: '+56 2 2636 2847',
      // Foto: Primer plano de una hamburguesa con queso derretido, muy apetitosa
      imgUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      mapaUrl: 'https://www.google.com/maps/search/?api=1&query=Av.+Providencia+1321'
    },
    {
      nombre: 'BK Mall Plaza Vespucio',
      direccion: 'Av. Vicuña Mackenna Ote. 7110 (Patio de Comidas)',
      comuna: 'La Florida',
      horario: 'Lun-Dom: 10:30 - 21:30',
      telefono: '+56 2 2636 2832',
      // Foto: Otra hamburguesa estilo parrilla con vegetales frescos
      imgUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
      mapaUrl: 'https://www.google.com/maps/search/?api=1&query=Mall+Plaza+Vespucio+Av.+Vicuña+Mackenna+Ote.+7110'
    }
  ];

}
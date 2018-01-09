<template>
  <div id="WorkersList">

<v-data-table
        v-model="selected"
        v-bind:headers="headers"
        v-bind:items="workers"
        select-all
        v-bind:pagination.sync="pagination"
        item-key="name"
        class="elevation-1"
      >
      <template slot="headers" slot-scope="props">
        <tr>
          <th>
            <v-checkbox
              primary
              hide-details
              @click.native="toggleAll"
              :input-value="props.all"
              :indeterminate="props.indeterminate"
            ></v-checkbox>
          </th>
          <th v-for="header in props.headers" :key="header.text"
            :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
            @click="changeSort(header.value)"
          >
            <v-icon>arrow_upward</v-icon>
            {{ header.text }}
          </th>
        </tr>
      </template>
      <template slot="items" slot-scope="props">
        <tr :active="props.selected"  :class="[props.item.fireDate!=null? 'red accent-1': '' ]"
        v-if="(!Boolean(props.item.fireDate) || isShowFire != Boolean(props.item.fireDate)) && (searchedName == ''||props.item.name.substring(0, searchedName.length).toLowerCase() == searchedName.toLowerCase())" >
        <!--"ПОКАЗЫВАЙ ЕСЛИ (не уволен ИЛИ стоит галочка и уволен) И (пустой поиск ИЛИ поиск равен имени)"-->
          <td>
            <v-checkbox
              @click="props.item.fireDate==null ? props.selected = !props.selected :''; funcSelectedWorkers()"
              v-if="props.item.fireDate == null"
              primary
              hide-details
              :input-value="props.selected"
            ></v-checkbox>
            <!--Скрывает чекбокс уволенных рабочих-->
          </td>
          <td>{{ props.item.name }}</td>
          <td class="text-xs-right">{{ props.item.companyName }}</td>
          <td class="text-xs-right">{{ props.item.positionName }}</td>
          <td class="text-xs-right">{{ props.item.hireDate }}</td>
          <td class="text-xs-right">{{ props.item.fireDate }}</td>
          <!--При клике если НЕ УВОЛЕН открывает диалоговое окно-->
          <td @click="props.item.fireDate==null ? showModalSalary= true:''; modelData = props.item.salary; modelFraction = props.item.fraction; currentId = props.item.id" class="text-xs-right">{{ props.item.salary }} &#8381; ({{ props.item.fraction }}%)</td>
          <td @click="props.item.fireDate==null ? showModalBase = true:''; modelData = props.item.base; currentId = props.item.id" :disabled="props.item.fireDate!=null" class="text-xs-right">{{ props.item.base }}</td>
          <td @click="props.item.fireDate==null ? showModalAdvance = true:''; modelData = props.item.advance; currentId = props.item.id" v-model="props.item.advance" class="text-xs-right">{{ props.item.advance }}</td>
          <td class="text-xs-right">
            <v-checkbox
              :disabled="props.item.fireDate!=null"
              hide-details
              v-model="props.item.byHours"
            ></v-checkbox>
          </td>
        </tr>
      </template>
    </v-data-table>

    <!--диалоговое окно СТАВКИ-->
    <div v-if="showModalSalary">
      <div @click="showModalSalary = false" class="modalWrapper"></div><!--Затемненние фона-->
      <div  class="customModal">
      <v-text-field
            
            label="Ставка, руб"
            name="field1"
            v-model="modelData"
            single-line
          ></v-text-field>
          <v-text-field
            label="Ставка, %"
            name="field1"
            v-model="modelFraction"
            single-line
          ></v-text-field>
      <v-btn @click="showModalSalary = false; currentId = null" color="green lighten-2">Отменить</v-btn>
      <v-btn @click="showModalSalary = false; methodSalary(currentId, modelData, modelFraction)" color="green lighten-2">Сохранить</v-btn>
      </div>
    </div>

    <!--диалоговое окно БАЗЫ-->
    <div v-if="showModalBase">
      <div @click="showModalBase = false" class="modalWrapper"></div><!--Затемненние фона-->
      <div  class="customModal">
      <v-text-field
            label="База, руб"
            name="field1"
            v-model="modelData"
            single-line
          ></v-text-field>
      <v-btn @click="showModalBase = false; currentId = null" color="green lighten-2">Отменить</v-btn>
      <v-btn @click="showModalBase = false; methodBase(currentId, modelData)" color="green lighten-2">Сохранить</v-btn>
      </div>
    </div>

    <!--диалоговое окно АВАНСА-->
    <div v-if="showModalAdvance">
      <div @click="showModalAdvance = false" class="modalWrapper"></div><!--Затемненние фона-->
      <div  class="customModal">
      <v-text-field
            label="Аванс, руб"
            name="field1"
            v-model="modelData"
            single-line
          ></v-text-field>
      <v-btn @click="showModalAdvance = false; currentId = null" color="green lighten-2">Отменить</v-btn>
      <v-btn @click="showModalAdvance = false; methodAdvance(currentId, modelData)" color="green lighten-2">Сохранить</v-btn>
      </div>
    </div>

  </div>
</template>


<script>
  var _ = require('underscore');
  //var workers = require("./workers");

  module.exports ={
    props: ['searchedName', 'isShowFire', 'workers'],
    data: function() {
      return {

        currentId: null,          //Id работника при редактировании
        showModalSalary: false,   //Показывать диалоговое окно СТАВКИ
        showModalBase: false,     //Показывать диалоговое окно БАЗЫ
        showModalAdvance: false,  //Показывать диалоговое окно АВАНСА
        modelData: null,          //Данные для диалоговых окон
        modelFraction: null,      //Данные Процентной СТАВКИ

        pagination: {
        sortBy: 'name'
        },
        selected: [],

        headers: [
        {
          text: 'Сотрудник',
          align: 'left',
          value: 'name'
        },
        { text: 'Компания', value: 'companyName' },
        { text: 'Должность', value: 'positionName' },
        { text: 'Дата приёма', value: 'hireDate' },
        { text: 'Дата увольнения', value: 'fireDate' },
        { text: 'Ставка', value: 'salary' },
        { text: 'База', value: 'base' },
        { text: 'Аванс', value: 'advance' },
        { text: 'Почасовая', value: 'byHours' }
      ]
    }
    },
    methods: {
      //Срабатывает при выборе рабочего
      //Передаёт его данные в App.vue,а от туда в WorkerSearch.vue 
      funcSelectedWorkers: function(){
        this.$emit('SelectedWorkers', this.selected);
      },
      toggleAll () {
        //Если выделены поля - то сними выделение. Иначе выдели все поля
        if (this.selected.length){ 
          this.selected = [];
          this.funcSelectedWorkers();
        }
        else{
          //Написать короче
          //Сортируем рабочих по выбранному полю
          var sortedArray = [];
          switch(this.pagination.sortBy) {
            case 'name':  
              sortedArray = _.sortBy(this.workers, function(worker) {return worker.name;});
              break
            case 'companyName':  
               sortedArray = _.sortBy(this.workers, function(worker) {return worker.companyName;});
              break
            case 'positionName':  
              sortedArray = _.sortBy(this.workers, function(worker) {return worker.positionName;});
              break
            case 'hireDate':  
              sortedArray = _.sortBy(this.workers, function(worker) {return worker.hireDate;});
              break
            case 'fireDate':  
              sortedArray = _.sortBy(this.workers, function(worker) {return worker.fireDate;});
              break
            case 'salary':  
              sortedArray = _.sortBy(this.workers, function(worker) {return worker.salary;});
              break
            case 'base':  
              sortedArray = _.sortBy(this.workers, function(worker) {return worker.base;});
              break
            case 'advance':  
              sortedArray = _.sortBy(this.workers, function(worker) { return worker.advance;});
              break
            case 'byHours':  
              sortedArray = _.sortBy(this.workers, function(worker) {return worker.byHours;});
              break
            default:
              sortedArray = _.sortBy(this.workers, function(worker) {return worker.name;});
              break
          }      
          //Обратная сортировка если нужно
          if(this.pagination.descending == true)
            sortedArray.reverse();
          //Заполняем чекбоксы всех полей на выбранной странице согласно сортировке
          for (var i = this.pagination.page*this.pagination.rowsPerPage-this.pagination.rowsPerPage; i < this.pagination.page*this.pagination.rowsPerPage; i++) {
            if (sortedArray[i].fireDate==null)
            {
              this.selected.push(sortedArray[i]);
              //Отправляем сформированный массив выделенных полей
              this.funcSelectedWorkers();
            }
          }

        }
        
      },
      //Сохранение данных СТАВКИ
      methodSalary (id, data, dataFraction) {
        //id - id работника, data - изменяемые данные
        console.log(this.selected); 
        for (var i = this.workers.length - 1; i >= 0; i--) {
          if(this.workers[i].id == id)
          {
            this.workers[i].salary = data;
            this.workers[i].fraction = dataFraction;
          }
        }
      },
      //Сохранение данных БАЗЫ
      methodBase (id, data) {
        //id - id работника, data - изменяемые данные 
        for (var i = this.workers.length - 1; i >= 0; i--) {
          if(this.workers[i].id == id)
            this.workers[i].base = data;
        }
      },
      //Сохранение данных АВАНСА
      methodAdvance (id, data) {
        //id - id работника, data - изменяемые данные 
        for (var i = this.workers.length - 1; i >= 0; i--) {
          if(this.workers[i].id == id)
            this.workers[i].advance = data;
        }
      },
      //Сортировка
      changeSort (column) {
        if (this.pagination.sortBy === column) {
          this.pagination.descending = !this.pagination.descending
        } else {
          this.pagination.sortBy = column
          this.pagination.descending = false
        }
      }
    }
  }
</script>

<style>
.customModal {
  position: absolute;
  opacity: 1;
  top: 40% ;
  right: 40%;
  background-color: white;
  box-shadow:0px 13px 25px 0px rgba(0,0,0,0.74);
  -webkit-box-shadow:0px 13px 25px 0px rgba(0,0,0,0.74);
  -moz-box-shadow:0px 13px 25px 0px rgba(0,0,0,0.74);
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
}

.modalWrapper {
  position: absolute;
  opacity: .4;
  top:0;
  height: 100%;
  width: 100%;
  background-color: black;
}
</style>

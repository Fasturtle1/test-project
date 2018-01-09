<template>
  <div id="WorkersSearch">
    <v-layout row> 
      <v-flex xs8>
        <v-subheader>Занимаемые должности</v-subheader>
      </v-flex>     
      <v-layout row right align-center> 
        <v-flex xs10 >
          <v-text-field
            name="searchField"
            label="Поиск по сотруднику"
            v-model="searchedName"  
            v-on:input="funcSearchData"
            single-line
          ></v-text-field>
        </v-flex>
        <v-flex xs1>
          <v-icon >search</v-icon>
        </v-flex>
      </v-layout>
    </v-layout>

    <v-layout row right  align-center> 
      <v-checkbox color="green darken-2" v-model ="isShowFire" v-on:click="funcIsShowFireData"></v-checkbox>
      <span>Показывать уволенных</span>
      <v-btn color="green lighten-2">Принять на должность</v-btn>
      <v-btn @click="funcFiredWorkers()" :disabled="selectedWorkers.length==0" color="red accent-1" >
        <span v-if="selectedWorkers.length<=1">Снять с должности</span>
        <span v-if="selectedWorkers.length>1">Снять с должностей</span>
      </v-btn>
    </v-layout>
  </div>
</template>

<script>

var dateFormat = require('dateformat');
  export default {

    props: ['selectedWorkers', 'workers'],
    data() {
      return {
        searchedName: '',   //Введённые данные поиска по сотруднику
        isShowFire: true   //Значение чекбокса "Показывать уволенных"
      }
    },
    methods: {
      //Передаём значение поиска родителю(в App.vue)
      funcSearchData: function(){
        this.$emit('funcSearchedName', this.searchedName);
      },
      //Передаём значение чекбокса родителю(в App.vue)
      funcIsShowFireData: function(){
        this.$emit('funcIsShowFire', this.isShowFire);
        this.isShowFire = !this.isShowFire; //Без этого чекбокс работает неадекватно
        console.log(this.selectedWorkers);
      },

      funcFiredWorkers: function(){
        for (var i = this.selectedWorkers.length - 1; i >= 0; i--) {
          for (var k = this.workers.length - 1; k >= 0; k--) {
            if(this.workers[k].id == this.selectedWorkers[i].id) {
              
              this.workers[k].fireDate = dateFormat(new Date(), "yyyy-mm-dd");
            }

          }
        }
        //this.selectedWorkers = [];
        //В родительский компонент
      }
    }
  }

</script>

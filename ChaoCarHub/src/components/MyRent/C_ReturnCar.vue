<script setup>
import { UsemyrentStore } from "@/stores/myRent"
import { computed, ref, reactive, onMounted } from "vue";
const myrentStore = UsemyrentStore()
defineProps({
  item: Object,
});
const isReturn = ref(false)

</script>

<template>
  <div class="pb-6">
    <div class="card has-text-centered p-5">
      <div class="columns is-10">
        <div class="card-header-title columns is-7">
          <div class="column is-8 is-size-3">
            {{ item.car_brand }} {{ item.car_model }}
            <div class="card-image image is-4by3">
              <img :src="`http://localhost:3000/${item.car_img}`" />
            </div>
          </div>
          <div class="column pl-6">
            <div class="column pt-6">
              <p class="subtitle is-size-7 column_number">
                <img src="https://cdn.discordapp.com/attachments/1072181252964233328/1078900607802408990/user.png"
                  height="20" width="20" />
                <span class="pl-2">{{ item.car_seat }} ที่นั้ง</span>
              </p>
            </div>
            <div class="column pt-5">
              <p class="subtitle is-size-7 column_number">
                <img src="https://cdn.discordapp.com/attachments/1072181252964233328/1078900607567540294/bag.png"
                  height="20" width="20" />
                <span class="pl-2">{{ item.car_bag }} กระเป๋า</span>
              </p>
            </div>
            <div class="column pt-5">
              <p class="subtitle is-size-7 column_number">
                <img src="https://cdn.discordapp.com/attachments/1072181252964233328/1078900607286509598/car-gear.png"
                  height="20" width="20" />
                <span class="pl-2">อัตโนมัติ</span>
              </p>
            </div>
          </div>
        </div>
        <div class="column is-4">
          <p v-if="!myrentStore.hadReturn.includes(item.r_id) && !isReturn" class="is-size-4"
            style="background-color: #99e2f2">
            <b>คืนรถ</b>
          </p>
          <p v-if="myrentStore.hadReturn.includes(item.r_id) || isReturn" class="is-size-4"
            style="background-color: #99e2f2">
            <b>กำลังดำเนินการ</b>
          </p>
          <div class="column p-5 is-size-6">
            <div class="column has-text-left">
              <p><b>การรับรถ</b></p>
              <p>{{ item.r_place_pickup }}</p>
              <p>{{ item.dayPickup }} เวลา {{ item.r_time_pickup.slice(0, 5) }} น.</p>
            </div>
            <div class="column has-text-left">
              <p><b>การคืนรถ</b></p>
              <p>{{ item.r_place_return }}</p>
              <p>{{ item.dayReturn }} เวลา {{ item.r_time_return.slice(0, 5) }} น.</p>
            </div>

            <!-- Check ว่ากดคืนรถหรือยัง ? -->
            <div v-if="(!myrentStore.hadReturn.includes(item.r_id) && !isReturn)">
              <!-- r_id : {{myrentStore.hadReturn.includes(item.r_id)}}<br/>
                isReturn : {{isReturn}} -->

              <div class="column has-text-left" style="color:red;"
                v-if="(currentDate && item.r_day_return) && (calculateDaysDifference(currentDate, item.r_day_return)) > 0">
                (เกินระยะเวลาการคืนรถเป็นเวลา
                {{ calculateDaysDifference(currentDate, item.r_day_return) }} วัน)

                <!-- คำนวณค่าปรับ : (ค่าเช่ารายวัน*จำนวนวัน) -->
                <!-- <div> ต้องชำระค่าปรับจำนวน
                    {{ item.r_totalprice*(calculateDaysDifference(currentDate, item.r_day_return)) }} บาท
                  </div> -->
              </div>

            </div>
          </div>
        </div>

      </div>
      <footer class="columns">
        <p class="column is-size-6">
          ราคาสำหรับ {{ item.r_amountdays }} วัน {{ item.r_totalprice }} บาท
        </p>
        <div class="column is-size-6 pl-6">
          <p class="subtitle is-size-6 column_number">
            <img src="https://media.discordapp.net/attachments/1072181252964233328/1079444615184257074/success_1.png"
              height="20" width="20" /><span class="pl-2"> ชำระเงินสำเร็จแล้ว</span>
          </p>
        </div>
        <!-- <h1> {{ isReturn }}</h1> -->
        <a class="column is-size-6"
          v-if="!myrentStore.hadReturn.includes(item.r_id) && isReturn == false && (calculateDaysDifference(currentDate, item.r_day_return)) > 0">
          <div class="pb-2" style="color:red;"> ต้องชำระค่าปรับจำนวน
            {{ ((item.r_totalprice/item.r_amountdays) * (calculateDaysDifference(currentDate, item.r_day_return))) + ((item.r_totalprice/item.r_amountdays) * (calculateDaysDifference(currentDate, item.r_day_return))/5) }} บาท
          </div>
          <button @click="myrentStore.btnReturn(item.r_id), isReturn = true" class="button btn has-text-white font"
            style="width: 100%">
            ชำระเงิน
          </button>
        </a>
        <a class="column is-size-6"
          v-else-if="!myrentStore.hadReturn.includes(item.r_id) && isReturn == false && (calculateDaysDifference(currentDate, item.r_day_return)) < 0">
          <button @click="myrentStore.btnReturn(item.r_id), isReturn = true" class="button btn has-text-white font"
            style="width: 100%">
            คืนรถ
          </button>
        </a>
        <a class="column is-size-6" v-if="myrentStore.hadReturn.includes(item.r_id) || isReturn">
          <button class="button btn has-text-white font" style="width: 100%; opacity: 40%">
            คืนรถ
          </button>
        </a>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentDate: ''
    };
  },
  mounted() {
    this.currentDate = this.getCurrentDate();
  },
  computed: {
    myrentStore() {
      return this.$store.state.myRent;
    }
  },
  methods: {
    getCurrentDate() {
      const current = new Date();
      const month = (current.getMonth() + 1).toString().padStart(2, '0');
      const date = `${current.getFullYear()}-${month}-${current.getDate()}`;
      console.log('Current Date: ', date);
      return date;
    },
    calculateDaysDifference(currentDate, returnDate) {
      const current = new Date(currentDate);
      const previous = new Date(returnDate);
      const timeDifference = current.getTime() - previous.getTime();
      const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
      return daysDifference;
    }
    // calculateDaysDifference(currentDate, returnDate, currentTime, returnTime) {
    //   const current = new Date(currentDate + 'T' + currentTime);
    //   const previous = new Date(returnDate + 'T' + returnTime);

    //   // Calculate the time difference in milliseconds
    //   const timeDifference = current.getTime() - previous.getTime();

    //   // Convert milliseconds to days, hours, minutes, seconds
    //   const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    //   return daysDifference;
    // }

  }
};
</script>


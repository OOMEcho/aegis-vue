import {loadDict, getDictLabel} from '@/utils/dict'

export default {
  data() {
    return {
      // 当前组件已加载的字典数据
      dicts: {}
    }
  },
  methods: {
    async loadDictOptions(dictType) {
      const list = await loadDict(dictType)
      this.$set(this.dicts, dictType, list)
      return list
    },
    dictLabel(dictType, value) {
      return getDictLabel(this.dicts[dictType] || [], value)
    }
  }
}

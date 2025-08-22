<template >
   <div class="rolePermission">
    <table>
      <thead>
        <tr>
          <th>角色</th>
          <th v-for="page in pageAll">
            {{ page.pageExp }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(role, index) in roleWithPageDatas" :key="index">
          <td>{{ role.role.roleName }}</td>
          <td v-for="(page, pageIndex) in pageAll" :key="pageIndex">
            <input
              type="checkbox"
              :checked="role.pages.some((p) => p.pageId === page.pageId)"
              @change="togglePermission(role.role.roleId, page.pageId, $event)"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <button @click="editRolePermission">確定更改</button>
    <table>
      <tbody>
        <tr>
          <td><input type="text" v-model="role.role.roleName" /></td>
          <td>{{ role.role.roleName }}</td>
          <td>
            <input
              v-for="(page, pageIndex) in pageAll"
              :key="pageIndex"
              type="checkbox"
              :value="page"
              v-model="role.pages"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="newRole">新增角色</button>
  </div>
</template>
<script setup>

</script>
<style scoped>
    
</style>
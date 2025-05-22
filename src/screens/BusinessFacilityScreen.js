import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BusinessFacilityScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [businessTypeSearch, setBusinessTypeSearch] = useState('');
  
  const [facilities, setFacilities] = useState([
    {
      id: '1',
      name: 'Cơ sở kinh doanh 1',
      address: '123 Đường Nguyễn Huệ',
      status: 'Hoạt động',
      licenseNumber: 'BL-2023-001',
      operationDate: '01/01/2023',
      expiryDate: '31/12/2025',
      owner: 'Nguyễn Văn A',
      contactPhone: '0123456789',
      contactEmail: 'nguyenvana@example.com',
      businessType: 'Nhà hàng',
      area: '120m²',
      employees: 15,
    },
    {
      id: '2',
      name: 'Cơ sở kinh doanh 2',
      address: '456 Đường Lê Lợi',
      status: 'Chờ phê duyệt',
      licenseNumber: 'BL-2023-002',
      operationDate: '15/03/2023',
      expiryDate: '14/03/2026',
      owner: 'Trần Thị B',
      contactPhone: '0987654321',
      contactEmail: 'tranthib@example.com',
      businessType: 'Cửa hàng bán lẻ',
      area: '80m²',
      employees: 8,
    },
    {
      id: '3',
      name: 'Cơ sở kinh doanh 3',
      address: '789 Đường Hàm Nghi',
      status: 'Không hoạt động',
      licenseNumber: 'BL-2022-015',
      operationDate: '10/07/2022',
      expiryDate: '09/07/2025',
      owner: 'Lê Văn C',
      contactPhone: '0123789456',
      contactEmail: 'levanc@example.com',
      businessType: 'Khách sạn',
      area: '500m²',
      employees: 25,
    }
  ]);

  // Filter facilities based on search and status
  const filteredFacilities = facilities.filter(facility => {
    // Match search query
    const matchesSearch = 
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      facility.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Match status filter
    const matchesStatus = statusFilter === 'all' || facility.status === statusFilter;
    
    // Match business type if specified
    const matchesBusinessType = 
      !businessTypeSearch || 
      facility.businessType.toLowerCase().includes(businessTypeSearch.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesBusinessType;
  });

  const handleViewDetails = (facility) => {
    navigation.navigate('BusinessFacilityDetail', { facility });
  };

  const handleAddFacility = () => {
    navigation.navigate('AddBusinessFacility');
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setBusinessTypeSearch('');
    setShowFilterModal(false);
  };
  
  const applyFilters = () => {
    setShowFilterModal(false);
  };

  const renderFacilityItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleViewDetails(item)}
    >
      <View style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          <Ionicons 
            name={item.status === 'Hoạt động' ? "business" : "business-outline"} 
            size={32} 
            color="#085924" 
          />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.address}</Text>
          <Text style={styles.cardSubtitle}>Loại hình: {item.businessType}</Text>
          <View style={[
            styles.statusBadge, 
            item.status === 'Hoạt động' ? styles.activeStatus : 
            item.status === 'Chờ phê duyệt' ? styles.pendingStatus : 
            styles.inactiveStatus
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#085924" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý cơ sở kinh doanh</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
          <Ionicons name="filter" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên, địa chỉ..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity 
          style={[styles.advancedSearchButton, advancedSearch && styles.activeAdvancedButton]}
          onPress={() => setAdvancedSearch(!advancedSearch)}
        >
          <Ionicons name={advancedSearch ? "chevron-up" : "chevron-down"} size={20} color="#085924" />
        </TouchableOpacity>
      </View>
      
      {advancedSearch && (
        <View style={styles.advancedSearchContainer}>
          <View style={styles.advancedSearchInputContainer}>
            <Text style={styles.advancedSearchLabel}>Loại hình kinh doanh:</Text>
            <TextInput
              style={styles.advancedSearchInput}
              placeholder="Nhập loại hình kinh doanh..."
              value={businessTypeSearch}
              onChangeText={setBusinessTypeSearch}
            />
          </View>
          
          <View style={styles.advancedSearchRow}>
            <Text style={styles.advancedSearchLabel}>Trạng thái:</Text>
            <View style={styles.statusChips}>
              <TouchableOpacity 
                style={[styles.statusChip, statusFilter === 'all' && styles.activeStatusChip]}
                onPress={() => setStatusFilter('all')}
              >
                <Text style={[styles.statusChipText, statusFilter === 'all' && styles.activeStatusChipText]}>
                  Tất cả
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statusChip, statusFilter === 'Hoạt động' && styles.activeStatusChip]}
                onPress={() => setStatusFilter('Hoạt động')}
              >
                <Text style={[styles.statusChipText, statusFilter === 'Hoạt động' && styles.activeStatusChipText]}>
                  Hoạt động
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statusChip, statusFilter === 'Chờ phê duyệt' && styles.activeStatusChip]}
                onPress={() => setStatusFilter('Chờ phê duyệt')}
              >
                <Text style={[styles.statusChipText, statusFilter === 'Chờ phê duyệt' && styles.activeStatusChipText]}>
                  Chờ phê duyệt
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statusChip, statusFilter === 'Không hoạt động' && styles.activeStatusChip]}
                onPress={() => setStatusFilter('Không hoạt động')}
              >
                <Text style={[styles.statusChipText, statusFilter === 'Không hoạt động' && styles.activeStatusChipText]}>
                  Không hoạt động
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetFilters}
          >
            <Text style={styles.resetButtonText}>Đặt lại bộ lọc</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{facilities.filter(f => f.status === 'Hoạt động').length}</Text>
          <Text style={styles.statLabel}>Hoạt động</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{facilities.filter(f => f.status === 'Chờ phê duyệt').length}</Text>
          <Text style={styles.statLabel}>Chờ duyệt</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{facilities.filter(f => f.status === 'Không hoạt động').length}</Text>
          <Text style={styles.statLabel}>Tạm ngưng</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{facilities.length}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>Đã tìm thấy {filteredFacilities.length} cơ sở</Text>
        
        {statusFilter !== 'all' && (
          <View style={styles.activeFilterContainer}>
            <Text style={styles.activeFilterLabel}>Lọc theo: </Text>
            <View style={styles.activeFilterBadge}>
              <Text style={styles.activeFilterText}>{statusFilter}</Text>
              <TouchableOpacity onPress={() => setStatusFilter('all')}>
                <Ionicons name="close-circle" size={16} color="#085924" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      
      <FlatList
        data={filteredFacilities}
        renderItem={renderFacilityItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={50} color="#085924" />
            <Text style={styles.emptyText}>Không tìm thấy cơ sở kinh doanh nào</Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddFacility}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Thêm cơ sở mới</Text>
      </TouchableOpacity>
      
      {/* Filter Modal */}
      <Modal
        transparent={true}
        visible={showFilterModal}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View 
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Tùy chọn lọc</Text>
            
            <Text style={styles.modalSectionTitle}>Trạng thái</Text>
            
            <TouchableOpacity 
              style={[styles.filterOption, statusFilter === 'all' && styles.selectedFilter]}
              onPress={() => setStatusFilter('all')}
            >
              <Text style={[styles.filterOptionText, statusFilter === 'all' && styles.selectedFilterText]}>
                Tất cả
              </Text>
              {statusFilter === 'all' && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterOption, statusFilter === 'Hoạt động' && styles.selectedFilter]}
              onPress={() => setStatusFilter('Hoạt động')}
            >
              <Text style={[styles.filterOptionText, statusFilter === 'Hoạt động' && styles.selectedFilterText]}>
                Hoạt động
              </Text>
              {statusFilter === 'Hoạt động' && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterOption, statusFilter === 'Chờ phê duyệt' && styles.selectedFilter]}
              onPress={() => setStatusFilter('Chờ phê duyệt')}
            >
              <Text style={[styles.filterOptionText, statusFilter === 'Chờ phê duyệt' && styles.selectedFilterText]}>
                Chờ phê duyệt
              </Text>
              {statusFilter === 'Chờ phê duyệt' && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterOption, statusFilter === 'Không hoạt động' && styles.selectedFilter]}
              onPress={() => setStatusFilter('Không hoạt động')}
            >
              <Text style={[styles.filterOptionText, statusFilter === 'Không hoạt động' && styles.selectedFilterText]}>
                Không hoạt động
              </Text>
              {statusFilter === 'Không hoạt động' && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
            
            <Text style={styles.modalSectionTitle}>Loại hình kinh doanh</Text>
            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập loại hình cần lọc..."
                value={businessTypeSearch}
                onChangeText={setBusinessTypeSearch}
              />
            </View>
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={styles.modalResetButton}
                onPress={resetFilters}
              >
                <Text style={styles.modalResetButtonText}>Đặt lại</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalApplyButton}
                onPress={applyFilters}
              >
                <Text style={styles.modalApplyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#085924',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  filterButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  advancedSearchButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  activeAdvancedButton: {
    backgroundColor: '#e0f2e9',
  },
  advancedSearchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  advancedSearchInputContainer: {
    marginBottom: 12,
  },
  advancedSearchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  advancedSearchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  advancedSearchRow: {
    marginBottom: 12,
  },
  statusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  statusChip: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeStatusChip: {
    backgroundColor: '#085924',
    borderColor: '#085924',
  },
  statusChipText: {
    fontSize: 12,
    color: '#333',
  },
  activeStatusChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resetButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resetButtonText: {
    color: '#085924',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#085924',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  resultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2e9',
    borderRadius: 16,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#085924',
    marginRight: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0f2e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  activeStatus: {
    backgroundColor: '#d4edda',
  },
  pendingStatus: {
    backgroundColor: '#fff3cd',
  },
  inactiveStatus: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#085924',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  modalInputContainer: {
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedFilter: {
    backgroundColor: '#085924',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalResetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  modalResetButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  modalApplyButton: {
    backgroundColor: '#085924',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalApplyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BusinessFacilityScreen; 
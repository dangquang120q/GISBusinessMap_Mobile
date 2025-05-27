import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ForeignerManagementScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [nationalitySearch, setNationalitySearch] = useState('');
  
  // Dummy data for foreigners
  const foreigners = [
    {
      id: '1',
      name: 'John Smith',
      passport: 'AB123456',
      nationality: 'Mỹ',
      status: 'Đang hoạt động',
      entryDate: '15/03/2023',
      expiryDate: '15/03/2024',
      phone: '0901234567',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      workPosition: 'Giám đốc kỹ thuật',
    },
    {
      id: '2',
      name: 'Maria Garcia',
      passport: 'XY789012',
      nationality: 'Tây Ban Nha',
      status: 'Chờ xác nhận',
      entryDate: '20/04/2023',
      expiryDate: '20/04/2024',
      phone: '0909876543',
      address: '456 Lê Lợi, Quận 1, TP.HCM',
      workPosition: 'Quản lý dự án',
    },
    {
      id: '3',
      name: 'Tanaka Yuki',
      passport: 'JP567890',
      nationality: 'Nhật Bản',
      status: 'Hết hạn',
      entryDate: '10/01/2023',
      expiryDate: '10/01/2024',
      phone: '0905555555',
      address: '789 Hàm Nghi, Quận 1, TP.HCM',
      workPosition: 'Chuyên gia tư vấn',
    },
    {
      id: '4',
      name: 'Kim Min-jun',
      passport: 'KR123789',
      nationality: 'Hàn Quốc',
      status: 'Đang hoạt động',
      entryDate: '05/02/2023',
      expiryDate: '05/02/2024',
      phone: '0902223333',
      address: '101 Lý Tự Trọng, Quận 1, TP.HCM',
      workPosition: 'Kỹ sư phần mềm',
    },
    {
      id: '5',
      name: 'Wang Li',
      passport: 'CN456123',
      nationality: 'Trung Quốc',
      status: 'Chờ xác nhận',
      entryDate: '12/05/2023',
      expiryDate: '12/05/2024',
      phone: '0904444555',
      address: '222 Phạm Ngũ Lão, Quận 1, TP.HCM',
      workPosition: 'Chuyên gia kinh tế',
    },
  ];
  
  // Filter foreigners based on search and status
  const filteredForeigners = foreigners.filter(foreigner => {
    // Match search query
    const matchesSearch = 
      foreigner.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      foreigner.passport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      foreigner.workPosition.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Match status filter
    const matchesStatus = statusFilter === 'all' || foreigner.status === statusFilter;
    
    // Match nationality if specified
    const matchesNationality = 
      !nationalitySearch || 
      foreigner.nationality.toLowerCase().includes(nationalitySearch.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesNationality;
  });
  
  const handleViewDetails = (foreigner) => {
    navigation.navigate('ForeignerDetail', { foreigner });
  };
  
  const handleAddForeigner = () => {
    navigation.navigate('AddForeigner');
  };
  
  const renderForeignerItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleViewDetails(item)}
    >
      <View style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={32} color="#085924" />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>Hộ chiếu: {item.passport}</Text>
          <Text style={styles.cardSubtitle}>Quốc tịch: {item.nationality}</Text>
          <View style={[
            styles.statusBadge, 
            item.status === 'Đang hoạt động' ? styles.activeStatus : 
            item.status === 'Chờ xác nhận' ? styles.pendingStatus : 
            styles.expiredStatus
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#085924" />
    </TouchableOpacity>
  );
  
  const resetFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setNationalitySearch('');
    setShowFilterModal(false);
  };
  
  const applyFilters = () => {
    setShowFilterModal(false);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý người nước ngoài</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
          <Ionicons name="filter" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên, hộ chiếu..."
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
            <Text style={styles.advancedSearchLabel}>Quốc tịch:</Text>
            <TextInput
              style={styles.advancedSearchInput}
              placeholder="Nhập quốc tịch..."
              value={nationalitySearch}
              onChangeText={setNationalitySearch}
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
                style={[styles.statusChip, statusFilter === 'Đang hoạt động' && styles.activeStatusChip]}
                onPress={() => setStatusFilter('Đang hoạt động')}
              >
                <Text style={[styles.statusChipText, statusFilter === 'Đang hoạt động' && styles.activeStatusChipText]}>
                  Đang hoạt động
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statusChip, statusFilter === 'Chờ xác nhận' && styles.activeStatusChip]}
                onPress={() => setStatusFilter('Chờ xác nhận')}
              >
                <Text style={[styles.statusChipText, statusFilter === 'Chờ xác nhận' && styles.activeStatusChipText]}>
                  Chờ xác nhận
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statusChip, statusFilter === 'Hết hạn' && styles.activeStatusChip]}
                onPress={() => setStatusFilter('Hết hạn')}
              >
                <Text style={[styles.statusChipText, statusFilter === 'Hết hạn' && styles.activeStatusChipText]}>
                  Hết hạn
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
          <Text style={styles.statNumber}>{foreigners.filter(f => f.status === 'Đang hoạt động').length}</Text>
          <Text style={styles.statLabel}>Hoạt động</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{foreigners.filter(f => f.status === 'Chờ xác nhận').length}</Text>
          <Text style={styles.statLabel}>Chờ duyệt</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{foreigners.filter(f => f.status === 'Hết hạn').length}</Text>
          <Text style={styles.statLabel}>Hết hạn</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{foreigners.length}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>Đã tìm thấy {filteredForeigners.length} người</Text>
        
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
        data={filteredForeigners}
        renderItem={renderForeignerItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={50} color="#085924" />
            <Text style={styles.emptyText}>Không tìm thấy người nước ngoài</Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddForeigner}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Đăng ký người nước ngoài mới</Text>
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
              style={[styles.filterOption, statusFilter === 'Đang hoạt động' && styles.selectedFilter]}
              onPress={() => setStatusFilter('Đang hoạt động')}
            >
              <Text style={[styles.filterOptionText, statusFilter === 'Đang hoạt động' && styles.selectedFilterText]}>
                Đang hoạt động
              </Text>
              {statusFilter === 'Đang hoạt động' && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterOption, statusFilter === 'Chờ xác nhận' && styles.selectedFilter]}
              onPress={() => setStatusFilter('Chờ xác nhận')}
            >
              <Text style={[styles.filterOptionText, statusFilter === 'Chờ xác nhận' && styles.selectedFilterText]}>
                Chờ xác nhận
              </Text>
              {statusFilter === 'Chờ xác nhận' && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterOption, statusFilter === 'Hết hạn' && styles.selectedFilter]}
              onPress={() => setStatusFilter('Hết hạn')}
            >
              <Text style={[styles.filterOptionText, statusFilter === 'Hết hạn' && styles.selectedFilterText]}>
                Hết hạn
              </Text>
              {statusFilter === 'Hết hạn' && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
            
            <Text style={styles.modalSectionTitle}>Quốc tịch</Text>
            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập quốc tịch cần lọc..."
                value={nationalitySearch}
                onChangeText={setNationalitySearch}
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
  expiredStatus: {
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

export default ForeignerManagementScreen;